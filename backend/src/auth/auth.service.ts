import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as fs from 'fs/promises';

const generateKeyPair = promisify(crypto.generateKeyPair);
const execAsync = promisify(exec);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private projectsService: ProjectsService,
  ) {}

  async register(dto: RegisterDto, ip: string, userAgent: string) {
    await this.verifyTurnstileToken(dto.turnstileToken);

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        description: 'User registered',
        ipAddress: ip,
      },
    });

    const token = await this.generateToken(user, ip, userAgent);
    return { user, token };
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    await this.verifyTurnstileToken(dto.turnstileToken);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Your account has been suspended. Please contact administrator.');
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - new Date().getTime()) / 60000);
      throw new UnauthorizedException(`Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`);
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      let failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'loginAttempts' } });
      const maxAttempts = setting?.value ? parseInt(setting.value, 10) : 5;

      let lockoutUntil: Date | null = null;
      if (failedAttempts >= maxAttempts) {
        lockoutUntil = new Date(new Date().getTime() + 15 * 60000); // 15 mins
        failedAttempts = 0;
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: failedAttempts, lockoutUntil },
      });

      if (lockoutUntil) {
        throw new UnauthorizedException(`Account locked due to too many failed attempts. Try again in 15 minutes.`);
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // If user has 2FA enabled, require 2FA verification
    if (user.isTwoFactorEnabled) {
      const tempToken = this.jwtService.sign({ sub: user.id, requires2fa: true }, { expiresIn: '5m' });
      return { requires2fa: true, tempToken };
    }

    await this.prisma.$transaction([
      this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          description: 'User logged in',
          ipAddress: ip,
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date(), failedLoginAttempts: 0, lockoutUntil: null },
      }),
    ]);

    const { password: _, ...userWithoutPassword } = user;
    const token = await this.generateToken(user, ip, userAgent);
    return { user: userWithoutPassword, token };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, ip: string) {
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: dto.email, id: { not: userId } },
    });

    if (existingEmail) {
      throw new ConflictException('Email is already in use by another account');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'UPDATE_PROFILE',
        description: 'User updated profile information',
        ipAddress: ip,
      },
    });

    return user;
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto, ip: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!passwordMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'UPDATE_PASSWORD',
        description: 'User changed password',
        ipAddress: ip,
      },
    });

    return { message: 'Password updated successfully' };
  }

  async generateSshKey(userId: string, ip: string) {
    const keyPath = `/tmp/key_${userId}_${Date.now()}`;
    try {
      await execAsync(
        `ssh-keygen -t ed25519 -C "portdock_${userId}" -N "" -f ${keyPath}`,
      );
      const privateKey = await fs.readFile(keyPath, 'utf8');
      const publicKey = await fs.readFile(`${keyPath}.pub`, 'utf8');

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          sshPrivateKey: privateKey,
          sshPublicKey: publicKey.trim(),
        },
      });

      await fs.unlink(keyPath).catch(() => {});
      await fs.unlink(`${keyPath}.pub`).catch(() => {});

      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'GENERATE_SSH_KEY',
          description: 'User generated a new SSH key',
          ipAddress: ip,
        },
      });

      return { sshPublicKey: user.sshPublicKey };
    } catch (error) {
      throw new BadRequestException('Failed to generate SSH key');
    }
  }

  async connectGithub(userId: string, token: string, ip: string) {
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Invalid token');
      const data = await res.json();

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          githubToken: token,
          githubUsername: data.login,
        },
      });

      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'CONNECT_GITHUB',
          description: `User connected GitHub account: ${data.login}`,
          ipAddress: ip,
        },
      });

      return { githubUsername: user.githubUsername };
    } catch (err) {
      throw new BadRequestException(
        'Failed to connect GitHub: Invalid Personal Access Token',
      );
    }
  }

  async disconnectGithub(userId: string, ip: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        githubToken: null,
        githubUsername: null,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'DISCONNECT_GITHUB',
        description: 'User disconnected GitHub account',
        ipAddress: ip,
      },
    });

    return { message: 'GitHub account disconnected' };
  }

  private async generateToken(
    user: { id: string; email: string; name: string; role?: string },
    ip: string,
    userAgent: string
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        ipAddress: ip,
        userAgent,
        expiresAt,
      },
    });

    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'USER',
      sessionId: session.id,
    });
  }

  private async verifyTurnstileToken(token: string | undefined) {
    if (process.env.NODE_ENV !== 'development' && !token) {
      throw new UnauthorizedException('Turnstile verification required');
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey || !token) return;

    try {
      const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            secret: secretKey,
            response: token,
          }),
        },
      );

      const data = await response.json();
      if (!data.success) {
        throw new UnauthorizedException('Turnstile verification failed');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Failed to verify Turnstile token');
    }
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        projects: {
          select: {
            id: true,
            name: true,
            domain: true,
            status: true,
          },
        },
      },
    });

    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const projects = await this.prisma.project.findMany({ where: { userId } });
    for (const project of projects) {
      await this.projectsService.remove(project.id, userId);
    }

    await this.prisma.user.delete({ where: { id: userId } });
    return {
      message: 'User account and all associated resources deleted successfully',
    };
  }

  async setup2fa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    
    const secretResult = speakeasy.generateSecret({ name: 'Portdock (' + user.email + ')' });
    const secret = secretResult.base32;
    const otpauthUrl = secretResult.otpauth_url || '';
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret }
    });
    
    return { qrCode: qrCodeDataUrl, secret };
  }

  async verify2fa(userId: string, token: string, isSetup: boolean, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) throw new UnauthorizedException('2FA not configured');
    
    const isValid = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token });
    if (!isValid) throw new UnauthorizedException('Invalid 2FA token');
    
    if (isSetup) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isTwoFactorEnabled: true }
      });
    }

    await this.prisma.$transaction([
      this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          description: 'User logged in with 2FA',
          ipAddress: ip,
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date(), failedLoginAttempts: 0, lockoutUntil: null },
      }),
    ]);
    
    const { password: _, ...userWithoutPassword } = user;
    const jwtToken = await this.generateToken(user, ip, userAgent);
    return { user: userWithoutPassword, token: jwtToken };
  }

}