import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateLogDto {
  userId: string;
  projectId?: string;
  action: string;
  description?: string;
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
      },
    });
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const [total, logs] = await Promise.all([
      this.prisma.activityLog.count({ where: { userId } }),
      this.prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          project: { select: { id: true, name: true } },
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
      },
    });
  }
}
