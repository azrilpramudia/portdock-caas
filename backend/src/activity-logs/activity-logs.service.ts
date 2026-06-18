import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateLogDto {
  userId: string;
  projectId?: string;
  action: string;
  description?: string;
  ipAddress?: string;
}

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLogDto) {
    return this.prisma.activityLog.create({
      data: {
        userId: dto.userId,
        projectId: dto.projectId,
        action: dto.action,
        description: dto.description,
        ipAddress: dto.ipAddress,
      },
    });
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 20,
    search?: string,
    actionFilter?: string,
    startDate?: string,
    endDate?: string,
    status?: string,
  ) {
    const whereClause: any = { userId };

    if (search) {
      whereClause.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { project: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (actionFilter && actionFilter !== 'All Actions') {
      whereClause.action = { contains: actionFilter, mode: 'insensitive' };
    }

    if (status && status !== 'All Status') {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    const [total, logs] = await Promise.all([
      this.prisma.activityLog.count({ where: whereClause }),
      this.prisma.activityLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          project: { select: { id: true, name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findRecent(userId: string, limit = 5) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        project: { select: { id: true, name: true } },
        user: { select: { name: true, email: true } },
      },
    });
  }

  async exportLogs(
    userId: string,
    search?: string,
    actionFilter?: string,
    startDate?: string,
    endDate?: string,
    status?: string,
  ): Promise<string> {
    const whereClause: any = { userId };

    if (search) {
      whereClause.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { project: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (actionFilter && actionFilter !== 'All Actions') {
      whereClause.action = { contains: actionFilter, mode: 'insensitive' };
    }

    if (status && status !== 'All Status') {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    const logs = await this.prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { name: true } },
        user: { select: { name: true } },
      },
    });

    const header = [
      'Time',
      'User',
      'Action',
      'Target',
      'Description',
      'Status',
    ];
    const rows = logs.map((log) => [
      log.createdAt.toISOString(),
      log.user?.name || 'User',
      log.action,
      log.project?.name || 'System',
      `"${(log.description || '').replace(/"/g, '""')}"`,
      log.status || 'Success',
      log.ipAddress || '-',
    ]);

    return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
