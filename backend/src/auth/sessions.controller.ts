import { Controller, Get, Delete, Param, UseGuards, Request, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('sessions')
@Controller('auth/sessions')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class SessionsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active sessions for current user' })
  async getSessions(@Request() req: any) {
    const sessions = await this.prisma.session.findMany({
      where: { userId: req.user.id },
      orderBy: { lastActive: 'desc' },
    });

    return sessions.map(session => ({
      ...session,
      isCurrent: session.id === req.user.sessionId,
    }));
  }

  @Delete('others')
  @ApiOperation({ summary: 'Revoke all other sessions' })
  async revokeOtherSessions(@Request() req: any) {
    if (!req.user.sessionId) {
      throw new BadRequestException('Current session ID is missing');
    }

    await this.prisma.session.deleteMany({
      where: {
        userId: req.user.id,
        id: { not: req.user.sessionId },
      },
    });

    return { message: 'All other sessions have been revoked' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke a specific session' })
  async revokeSession(@Request() req: any, @Param('id') id: string) {
    if (id === req.user.sessionId) {
      throw new BadRequestException('Cannot revoke the current session here, please logout instead');
    }

    const session = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!session || session.userId !== req.user.id) {
      throw new UnauthorizedException('Session not found or not authorized');
    }

    await this.prisma.session.delete({
      where: { id },
    });

    return { message: 'Session revoked successfully' };
  }
}
