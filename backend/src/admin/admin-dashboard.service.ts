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
export class AdminDashboardService {
  private readonly logger = new Logger(AdminDashboardService.name);
  private dashboardStatsCache: AdminDashboardResponseDto | null = null;
  private dashboardStatsCacheTime = 0;
  private readonly CACHE_TTL = 60 * 1000; // 60 seconds

  constructor(
    private prisma: PrismaService,
    private system: SystemService,
    private dockerService: DockerService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getDashboardStats(): Promise<AdminDashboardResponseDto> {
    const nowTime = Date.now();
    if (
      this.dashboardStatsCache &&
      nowTime - this.dashboardStatsCacheTime < this.CACHE_TTL
    ) {
      return this.dashboardStatsCache;
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalProjects,
      totalContainers,
      activeDeployments,
      totalUsers,
      containerRunning,
      containerStopped,
      containerError,
      recentDeploymentsData,
      recentActivities,
      resources,
      serviceStatus,
      dockerStorage,
      projectsThisWeek,
      projectsLastWeek,
      usersThisWeek,
      usersLastWeek,
      containersThisWeek,
      containersLastWeek,
      activeDeploymentsThisWeek,
      activeDeploymentsLastWeek,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.container.count(),
      this.prisma.project.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count(),
      this.prisma.container.count({ where: { status: 'RUNNING' } }),
      this.prisma.container.count({ where: { status: 'STOPPED' } }),
      this.prisma.container.count({ where: { status: 'ERROR' } }),
      this.prisma.deployment.findMany({
        take: 5,
        orderBy: { startedAt: 'desc' },
        include: { project: { include: { user: true } } },
      }),
      this.prisma.activityLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true, project: true },
      }),
      this.system.getSystemResources(),
      this.system.getServiceHealth(),
      this.system.getDockerStorage(),
      this.prisma.project.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      this.prisma.project.count({
        where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } },
      }),
      this.prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      this.prisma.user.count({
        where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } },
      }),
      this.prisma.container.count({
        where: { createdAt: { gte: oneWeekAgo } },
      }),
      this.prisma.container.count({
        where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } },
      }),
      this.prisma.project.count({
        where: { status: 'ACTIVE', createdAt: { gte: oneWeekAgo } },
      }),
      this.prisma.project.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
        },
      }),
    ]);

    const successRate =
      totalProjects > 0
        ? Math.round((activeDeployments / totalProjects) * 100)
        : 100;
    const successRateLastWeek =
      projectsLastWeek > 0
        ? Math.round((activeDeploymentsLastWeek / projectsLastWeek) * 100)
        : 100;

    const recentDeployments = recentDeploymentsData.map((d) => {
      let durationStr = '-';
      if (d.endedAt && d.startedAt) {
        const diffInSeconds = Math.floor(
          (d.endedAt.getTime() - d.startedAt.getTime()) / 1000,
        );
        if (diffInSeconds > 0) {
          const m = Math.floor(diffInSeconds / 60);
          const s = diffInSeconds % 60;
          durationStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else {
          durationStr = '< 1s';
        }
      }

      return {
        id: `#DEP-${d.id.substring(d.id.length - 4).toUpperCase()}`,
        project: d.project.name,
        user: d.project.user.email,
        status:
          (d.status === 'Success'
            ? 'Success'
            : d.status === 'Failed'
              ? 'Failed'
              : 'Building') as 'Success' | 'Failed' | 'Building',
        time: d.startedAt.toISOString(),
        duration: durationStr,
      };
    });

    const recentActivity = recentActivities.map((a) => ({
      id: a.id,
      user: a.user.email,
      action: a.action,
      project: a.project?.name || 'System',
      time: a.createdAt.toISOString(),
    }));

    const result = {
      stats: {
        totalProjects,
        totalContainers,
        activeDeployments,
        totalUsers,
        successRate,
        runningContainers: containerRunning,
        totalProjectsTrend: calculateTrend(projectsThisWeek, projectsLastWeek),
        totalContainersTrend: calculateTrend(
          containersThisWeek,
          containersLastWeek,
        ),
        activeDeploymentsTrend: calculateTrend(
          activeDeploymentsThisWeek,
          activeDeploymentsLastWeek,
        ),
        totalUsersTrend: calculateTrend(usersThisWeek, usersLastWeek),
        successRateTrend: calculateTrend(successRate, successRateLastWeek),
      },
      resources,
      containerStatus: {
        active: containerRunning,
        stopped: containerStopped,
        failed: containerError,
      },
      recentDeployments,
      recentActivity,
      serviceStatus,
      dockerStorage,
    };

    this.dashboardStatsCache = result;
    this.dashboardStatsCacheTime = nowTime;
    return result;
  }

  async getSettings(): Promise<Record<string, string>> {
    const settings = await this.prisma.systemSetting.findMany();
    const formatted: Record<string, string> = {};
    for (const setting of settings) {
      formatted[setting.key] = setting.value;
    }
    return formatted;
  }

  async updateSettings(data: Record<string, string>): Promise<void> {
    let previousMaintenanceState = 'false';
    if (data.maintenanceMode !== undefined) {
      const prevSetting = await this.prisma.systemSetting.findUnique({
        where: { key: 'maintenanceMode' },
      });
      previousMaintenanceState = prevSetting?.value || 'false';
    }

    const operations = Object.entries(data).map(([key, value]) => {
      let category = 'general';
      if (['twoFactor', 'sessionTimeout', 'loginAttempts'].includes(key))
        category = 'security';
      if (['theme', 'primaryColor', 'sidebarStyle'].includes(key))
        category = 'appearance';
      if (
        [
          'dataRetention',
          'autoCleanup',
          'maintenanceMode',
          'checkUpdates',
        ].includes(key)
      )
        category = 'system';
      if (['backupSchedule', 'backupRetention'].includes(key))
        category = 'backup';
      if (
        [
          'notifyDeployments',
          'notifySystem',
          'notifySecurity',
          'notifyMaintenance',
          'emailDigest',
        ].includes(key)
      )
        category = 'notifications';

      return this.prisma.systemSetting.upsert({
        where: { key },
        update: { value, category },
        create: { key, value, category },
      });
    });

    await this.prisma.$transaction(operations);

    if (
      data.maintenanceMode !== undefined &&
      data.maintenanceMode !== previousMaintenanceState
    ) {
      this.eventEmitter.emit('system.maintenance.toggled', {
        enabled: data.maintenanceMode === 'true',
      });
    }
  }
}
