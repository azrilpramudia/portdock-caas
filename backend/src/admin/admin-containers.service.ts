import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AdminDashboardResponseDto } from './dto/admin-dashboard.dto';
import { SystemService } from './system.service';
import * as bcrypt from 'bcrypt';
import { DockerService } from '../docker/docker.service';

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

@Injectable()
export class AdminContainersService {
  private readonly logger = new Logger(AdminContainersService.name);
  constructor(
    private prisma: PrismaService,
    private system: SystemService,
    private dockerService: DockerService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getAllContainers(filters?: Record<string, string>) {
    const containers = await this.prisma.container.findMany({
      include: {
        project: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let augmentedContainers = await Promise.all(
      containers.map(async (c) => {
        let liveStats: any = null;
        if (c.status === 'RUNNING' && c.dockerContainerId) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const stats = await this.dockerService.getContainerStats(
              c.dockerContainerId,
            );
            const info = await this.dockerService.inspectContainer(
              c.dockerContainerId,
            );

            // Calculate CPU
            const cpuDelta =
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              stats.cpu_stats.cpu_usage.total_usage -
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              (stats.precpu_stats?.cpu_usage?.total_usage || 0);
            const systemCpuDelta =
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              stats.cpu_stats.system_cpu_usage -
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              (stats.precpu_stats?.system_cpu_usage || 0);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const numCores = stats.cpu_stats.online_cpus || 1;
            let cpuPercent = 0;
            if (systemCpuDelta > 0 && cpuDelta > 0) {
              cpuPercent = (cpuDelta / systemCpuDelta) * numCores * 100;
            }

            // Calculate Memory
            const memoryUsage =
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              stats.memory_stats.usage - (stats.memory_stats.stats?.cache || 0);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const memoryLimit =
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              stats.memory_stats.limit ||
              (c.memoryLimit ? c.memoryLimit * 1024 * 1024 : 0);
            let memoryPercent = 0;
            if (memoryLimit > 0) {
              memoryPercent = (memoryUsage / memoryLimit) * 100;
            }

            liveStats = {
              cpuPercent: parseFloat(cpuPercent.toFixed(2)),
              memoryUsage,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              memoryLimit,
              memoryPercent: parseFloat(memoryPercent.toFixed(2)),
              startedAt: info.State?.StartedAt || null,
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            // Ignore error if container stats cannot be fetched, it might have stopped
          }
        }

        return {
          ...c,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          liveStats,
        };
      }),
    );

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const totalContainersThisWeek = containers.filter(
      (c) => c.createdAt >= oneWeekAgo,
    ).length;
    const totalContainersLastWeek = containers.filter(
      (c) => c.createdAt >= twoWeeksAgo && c.createdAt < oneWeekAgo,
    ).length;

    const runningContainersThisWeek = containers.filter(
      (c) => c.status === 'RUNNING' && c.createdAt >= oneWeekAgo,
    ).length;
    const runningContainersLastWeek = containers.filter(
      (c) =>
        c.status === 'RUNNING' &&
        c.createdAt >= twoWeeksAgo &&
        c.createdAt < oneWeekAgo,
    ).length;

    const stoppedContainersThisWeek = containers.filter(
      (c) => c.status === 'STOPPED' && c.createdAt >= oneWeekAgo,
    ).length;
    const stoppedContainersLastWeek = containers.filter(
      (c) =>
        c.status === 'STOPPED' &&
        c.createdAt >= twoWeeksAgo &&
        c.createdAt < oneWeekAgo,
    ).length;

    const exitedContainersThisWeek = containers.filter(
      (c) =>
        (c.status === 'ERROR' || c.status === 'REMOVING') &&
        c.createdAt >= oneWeekAgo,
    ).length;
    const exitedContainersLastWeek = containers.filter(
      (c) =>
        (c.status === 'ERROR' || c.status === 'REMOVING') &&
        c.createdAt >= twoWeeksAgo &&
        c.createdAt < oneWeekAgo,
    ).length;

    const imagesArrayThisWeek = containers
      .filter((c) => c.createdAt >= oneWeekAgo)
      .map((c) => c.imageName);
    const imagesArrayLastWeek = containers
      .filter((c) => c.createdAt >= twoWeeksAgo && c.createdAt < oneWeekAgo)
      .map((c) => c.imageName);

    const stats = {
      totalContainers: containers.length,
      runningContainers: containers.filter((c) => c.status === 'RUNNING')
        .length,
      stoppedContainers: containers.filter((c) => c.status === 'STOPPED')
        .length,
      exitedContainers: containers.filter(
        (c) => c.status === 'ERROR' || c.status === 'REMOVING',
      ).length,
      totalImages: new Set(containers.map((c) => c.imageName)).size,
      totalContainersTrend: calculateTrend(
        totalContainersThisWeek,
        totalContainersLastWeek,
      ),
      runningContainersTrend: calculateTrend(
        runningContainersThisWeek,
        runningContainersLastWeek,
      ),
      stoppedContainersTrend: calculateTrend(
        stoppedContainersThisWeek,
        stoppedContainersLastWeek,
      ),
      exitedContainersTrend: calculateTrend(
        exitedContainersThisWeek,
        exitedContainersLastWeek,
      ),
      totalImagesTrend: calculateTrend(
        new Set(imagesArrayThisWeek).size,
        new Set(imagesArrayLastWeek).size,
      ),
    };

    // Apply filters to the returned list
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        augmentedContainers = augmentedContainers.filter(
          (c) => c.status.toLowerCase() === filters.status.toLowerCase(),
        );
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        augmentedContainers = augmentedContainers.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.imageName.toLowerCase().includes(q) ||
            c.project.name.toLowerCase().includes(q) ||
            (c.project.domain && c.project.domain.toLowerCase().includes(q)) ||
            c.project.user.name.toLowerCase().includes(q) ||
            c.project.user.email.toLowerCase().includes(q),
        );
      }
      if (filters.projectId && filters.projectId !== 'all') {
        augmentedContainers = augmentedContainers.filter(
          (c) => c.projectId === filters.projectId,
        );
      }
      if (filters.userId && filters.userId !== 'all') {
        augmentedContainers = augmentedContainers.filter(
          (c) => c.project.user.id === filters.userId,
        );
      }
    }

    return {
      stats,
      containers: augmentedContainers,
    };
  }

  async startContainer(id: string) {
    const container = await this.prisma.container.findUnique({ where: { id } });
    if (!container) throw new NotFoundException('Container not found');
    if (!container.dockerContainerId)
      throw new NotFoundException('Docker container not found');

    await this.dockerService.startContainer(container.dockerContainerId);
    return this.prisma.container.update({
      where: { id },
      data: { status: 'RUNNING' },
    });
  }

  async stopContainer(id: string) {
    const container = await this.prisma.container.findUnique({ where: { id } });
    if (!container) throw new NotFoundException('Container not found');
    if (!container.dockerContainerId)
      throw new NotFoundException('Docker container not found');

    await this.dockerService.stopContainer(container.dockerContainerId);
    return this.prisma.container.update({
      where: { id },
      data: { status: 'STOPPED' },
    });
  }

  async restartContainer(id: string) {
    const container = await this.prisma.container.findUnique({ where: { id } });
    if (!container) throw new NotFoundException('Container not found');
    if (!container.dockerContainerId)
      throw new NotFoundException('Docker container not found');

    await this.dockerService.restartContainer(container.dockerContainerId);
    return this.prisma.container.update({
      where: { id },
      data: { status: 'RUNNING' },
    });
  }

  async deleteContainer(id: string) {
    const container = await this.prisma.container.findUnique({ where: { id } });
    if (!container) throw new NotFoundException('Container not found');

    if (container.dockerContainerId) {
      try {
        await this.dockerService.removeContainer(container.dockerContainerId);
      } catch (err) {
        console.warn(
          `Failed to remove docker container ${container.dockerContainerId}:`,
          err,
        );
      }
    }

    return this.prisma.container.delete({
      where: { id },
    });
  }
}
