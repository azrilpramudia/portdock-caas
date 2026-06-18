import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('terminal-logs')
@UseGuards(JwtAuthGuard)
export class TerminalController {
  constructor(private prisma: PrismaService) {}

  @Get(':containerId')
  async getTerminalLogs(@Param('containerId') containerId: string) {
    const container = await this.prisma.container.findUnique({
      where: { id: containerId },
      include: { project: true },
    });

    if (!container) {
      return [];
    }

    const logs = await this.prisma.terminalLog.findMany({
      where: { projectId: container.projectId },
      orderBy: { executedAt: 'desc' },
      take: 100,
    });

    return logs;
  }
}
