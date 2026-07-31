import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (
          req &&
          req.cookies &&
          req.cookies['access_token'] &&
          req.cookies['access_token'] !== 'undefined'
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          token = req.cookies['access_token'];
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    name: string;
    role: string;
    sessionId?: string;
  }) {
    if (payload.sessionId) {
      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
      });
      if (!session) {
        throw new UnauthorizedException('Session expired or revoked');
      }

      // Update last active
      await this.prisma.session
        .update({
          where: { id: payload.sessionId },
          data: { lastActive: new Date() },
        })
        .catch(() => {}); // Ignore errors if it fails to update (e.g., race condition)
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
