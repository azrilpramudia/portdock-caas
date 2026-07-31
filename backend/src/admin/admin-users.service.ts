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
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);
  constructor(
    private prisma: PrismaService,
    private system: SystemService,
    private dockerService: DockerService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: { projects: true },
        },
        projects: {
          select: {
            _count: {
              select: { containers: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
    const suspendedUsers = users.filter((u) => u.status === 'SUSPENDED').length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = users.filter((u) => u.createdAt >= sevenDaysAgo).length;

    const mappedUsers = users.map((u) => {
      const containerCount = u.projects.reduce(
        (acc, p) => acc + p._count.containers,
        0,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { projects: _, ...rest } = u;
      return {
        ...rest,
        projectsCount: u._count.projects,
        containersCount: containerCount,
      };
    });

    return {
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        newUsers,
      },
      users: mappedUsers,
    };
  }

  async createUser(data: any) {
    const existingUser = await this.prisma.user.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return this.prisma.user.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        name: data.name,

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        email: data.email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashedPassword,

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        role: data.role || 'USER',

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        status: data.status || 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateUser(id: string, data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: any = {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.name !== undefined) updateData.name = data.name;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.email !== undefined) updateData.email = data.email;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.role !== undefined) updateData.role = data.role;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.status !== undefined) updateData.status = data.status;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.password) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    return this.prisma.user.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async deleteUser(id: string) {
    this.logger.log(`Starting cleanup for user ${id}`);

    // 1. Cleanup Project Containers
    const projects = await this.prisma.project.findMany({
      where: { userId: id },
      include: { containers: true },
    });

    for (const project of projects) {
      for (const container of project.containers) {
        if (container.dockerContainerId) {
          this.logger.log(
            `Stopping and removing project container: ${container.dockerContainerId}`,
          );
          try {
            await this.dockerService.stopContainer(container.dockerContainerId);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            // ignore if already stopped or not found
          }
          try {
            await this.dockerService.removeContainer(
              container.dockerContainerId,
              true,
            );
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            // ignore if already removed
          }
        }
      }
    }

    // 2. Cleanup Database Containers and Volumes
    const databases = await this.prisma.managedDatabase.findMany({
      where: { userId: id },
    });

    for (const db of databases) {
      if (db.dockerContainerId) {
        this.logger.log(
          `Stopping and removing database container: ${db.dockerContainerId}`,
        );
        try {
          await this.dockerService.stopContainer(db.dockerContainerId);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {}
        try {
          await this.dockerService.removeContainer(db.dockerContainerId, true);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {}
      }
      if (db.volumeName) {
        this.logger.log(`Removing database volume: ${db.volumeName}`);
        try {
          await this.dockerService.removeVolume(db.volumeName);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {}
      }
    }

    // 3. Finally, delete the user (Cascade handles the DB rows)
    this.logger.log(`Deleting user record ${id}`);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
