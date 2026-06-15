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

    // Generate realistic mock time-series data for the chart
    // In a real production system, this would be queried from Prometheus or InfluxDB
    const chartData: any[] = [];
    const now = new Date();
    const baseCpu = runningContainers > 0 ? 15 + (runningContainers * 5) : 0;
    const baseRam = runningContainers > 0 ? 20 + (runningContainers * 8) : 0;
    
    for (let i = 6; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60000); // Past 30 mins, 5 min intervals
      chartData.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: runningContainers > 0 ? Math.max(0, Math.min(100, Math.floor(baseCpu + (Math.random() * 15 - 5)))) : 0,
        ram: runningContainers > 0 ? Math.max(0, Math.min(100, Math.floor(baseRam + (Math.random() * 10 - 3)))) : 0,
      });
    }

    return {
      totalProjects,
      totalContainers,
      runningContainers,
      totalDeployments,
      recentProjects,
      recentActivity,
      chartData,
    };
  }
}
