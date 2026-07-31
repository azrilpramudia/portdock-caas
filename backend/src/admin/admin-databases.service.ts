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
export class AdminDatabasesService {
  private readonly logger = new Logger(AdminDatabasesService.name);
  constructor(
    private prisma: PrismaService,
    private system: SystemService,
    private dockerService: DockerService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getAllDatabases(filters?: Record<string, string>) {
    let databases = await this.prisma.managedDatabase.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (filters?.search) {
      databases = databases.filter(
        (db) =>
          db.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          db.user.email.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }

    if (filters?.status) {
      databases = databases.filter((db) => db.status === filters.status);
    }

    const totalDatabases = databases.length;
    const runningDatabases = databases.filter(
      (db) => db.status === 'RUNNING',
    ).length;

    return {
      stats: {
        totalDatabases,
        runningDatabases,
      },
      databases,
    };
  }

  async getDatabase(id: string) {
    return this.prisma.managedDatabase.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
