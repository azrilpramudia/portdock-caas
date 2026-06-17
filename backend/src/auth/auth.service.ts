import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as crypto from 'crypto';
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
  ) {}

  async register(dto: RegisterDto, ip: string) {
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

    const token = this.generateToken(user as any);
    return { user, token };
  }

  async login(dto: LoginDto, ip: string) {
    await this.verifyTurnstileToken(dto.turnstileToken);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        description: 'User logged in',
        ipAddress: ip,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    const token = this.generateToken(user);
    return { user: userWithoutPassword, token };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
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

    const passwordMatch = await bcrypt.compare(dto.currentPassword, user.password);
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
      await execAsync(`ssh-keygen -t ed25519 -C "portdock_${userId}" -N "" -f ${keyPath}`);
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
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Invalid token');
      const data = await res.json();
      
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          githubToken: token,
          githubUsername: data.login,
        }
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
      throw new BadRequestException('Failed to connect GitHub: Invalid Personal Access Token');
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

  private generateToken(user: { id: string; email: string; name: string }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
    });
  }

  private async verifyTurnstileToken(token: string | undefined) {
    if (process.env.NODE_ENV !== 'development' && !token) {
      throw new UnauthorizedException('Turnstile verification required');
    }
    
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey || !token) return;

    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new UnauthorizedException('Turnstile verification failed');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Failed to verify Turnstile token');
    }
  }
}
