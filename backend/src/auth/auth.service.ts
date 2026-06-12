import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
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
      },
    });

    const token = this.generateToken(user as any);
    return { user, token };
  }

  async login(dto: LoginDto) {
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
