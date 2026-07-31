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
export class AdminActivityService {
  private readonly logger = new Logger(AdminActivityService.name);
  constructor(
    private prisma: PrismaService,
    private system: SystemService,
    private dockerService: DockerService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getAllActivityLogs(filters: any = {}) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {
      page = 1,
      limit = 50,
      search,
      action,
      status,
      dateRange,
      userId,
    } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (search) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.OR = [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { action: { contains: search, mode: 'insensitive' } },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { description: { contains: search, mode: 'insensitive' } },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { user: { name: { contains: search, mode: 'insensitive' } } },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { project: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (action && action !== 'all') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where.action = action;
    }

    if (status && status !== 'all') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where.status = status;
    }

    if (userId && userId !== 'all') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where.userId = userId;
    }

    if (dateRange && dateRange !== 'all') {
      const date = new Date();
      if (dateRange === '7days') {
        date.setDate(date.getDate() - 7);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        where.createdAt = { gte: date };
      } else if (dateRange === '30days') {
        date.setDate(date.getDate() - 30);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        where.createdAt = { gte: date };
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where,
        include: {
          user: {
            select: { name: true, email: true, role: true },
          },
          project: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.prisma.activityLog.count({ where }),
    ]);

    // Calculate overall stats for the cards
    const [
      totalActivities,
      userActivities,
      systemActivities,
      deploymentActivities,
      securityActivities,
    ] = await Promise.all([
      this.prisma.activityLog.count(),
      this.prisma.activityLog.count({ where: { user: { role: 'USER' } } }),
      this.prisma.activityLog.count({ where: { user: { role: 'ADMIN' } } }),
      this.prisma.activityLog.count({
        where: {
          action: { in: ['Deploy', 'Start', 'Stop', 'Restart', 'Delete'] },
        },
      }),
      this.prisma.activityLog.count({
        where: { action: { in: ['Login', 'Update', 'Alert', 'Failed Login'] } },
      }),
    ]);

    return {
      stats: {
        totalActivities,
        userActivities,
        systemActivities,
        deploymentActivities,
        securityActivities,
        totalActivitiesTrend: '+0%',
        userActivitiesTrend: '+0%',
        systemActivitiesTrend: '+0%',
        deploymentActivitiesTrend: '+0%',
        securityActivitiesTrend: '+0%',
      },
      activities: logs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async exportAllActivityLogs(filters: any = {}): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { search, action, status, dateRange, userId } = filters;

    const where: any = {};

    if (search) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.OR = [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { action: { contains: search, mode: 'insensitive' } },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { description: { contains: search, mode: 'insensitive' } },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { user: { name: { contains: search, mode: 'insensitive' } } },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { project: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (action && action !== 'all') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where.action = action;
    }

    if (status && status !== 'all') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where.status = status;
    }

    if (userId && userId !== 'all') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where.userId = userId;
    }

    if (dateRange && dateRange !== 'all') {
      const date = new Date();
      if (dateRange === '7days') {
        date.setDate(date.getDate() - 7);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        where.createdAt = { gte: date };
      } else if (dateRange === '30days') {
        date.setDate(date.getDate() - 30);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        where.createdAt = { gte: date };
      }
    }

    const logs = await this.prisma.activityLog.findMany({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where,
      include: {
        user: { select: { name: true, email: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = [
      'Date',
      'Time',
      'User',
      'Email',
      'Action',
      'Resource',
      'Status',
      'IP Address',
      'Description',
    ];
    const rows = logs.map((log) => [
      log.createdAt.toISOString().split('T')[0],
      log.createdAt.toISOString().split('T')[1].split('.')[0],
      log.user.name,
      log.user.email,
      log.action,
      log.project?.name || 'System',
      log.status,
      log.ipAddress || '-',
      `"${(log.description || '').replace(/"/g, '""')}"`,
    ]);

    return [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}
