import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DockerService } from '../docker/docker.service';

@Injectable()
export class MonitoringService {
  constructor(
    private prisma: PrismaService,
    private docker: DockerService,
  ) {}

  async getContainerStats(containerId: string, userId: string) {
    const container = await this.prisma.container.findUnique({
      where: { id: containerId },
      include: { project: { select: { userId: true } } },
    });

    if (!container) throw new NotFoundException('Container not found');
    if (container.project.userId !== userId) throw new ForbiddenException();
    if (!container.dockerContainerId)
      throw new NotFoundException('Docker container not found');

    try {
      const rawStats = await this.docker.getContainerStats(
        container.dockerContainerId,
      );
      const parsed = this.docker.parseStats(rawStats);
      return {
        containerId,
        name: container.name,
        status: container.status,
        ...parsed,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        containerId,
        name: container.name,
        status: container.status,
        cpuPercent: 0,
        memUsageMb: 0,
        memLimitMb: 0,
        memPercent: 0,
        netRxMb: 0,
        netTxMb: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getDashboardStats(userId: string) {
    const [totalProjects, totalContainers, runningContainers] =
      await Promise.all([
        this.prisma.project.count({ where: { userId } }),
        this.prisma.container.count({ where: { project: { userId } } }),
        this.prisma.container.count({
          where: { project: { userId }, status: 'RUNNING' },
        }),
      ]);

    const recentProjects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { containers: { select: { id: true, status: true } } },
    });

    const recentActivity = await this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { project: { select: { id: true, name: true } } },
    });

    const totalDeployments = await this.prisma.activityLog.count({
      where: {
        userId,
        action: { in: ['DEPLOYMENT_SUCCESS', 'DEPLOYMENT_STARTED'] },
      },
    });

    return {
      totalProjects,
      totalContainers,
      runningContainers,
      totalDeployments,
      recentProjects,
      recentActivity,
    };
  }
}
