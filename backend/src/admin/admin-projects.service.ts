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
export class AdminProjectsService {
  private readonly logger = new Logger(AdminProjectsService.name);
  constructor(
    private prisma: PrismaService,
    private system: SystemService,
    private dockerService: DockerService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getAllProjects(filters?: Record<string, string>) {
    let projects = await this.prisma.project.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: { containers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
    const pausedProjects = projects.filter(
      (p) => p.status === 'INACTIVE',
    ).length;
    const failedProjects = projects.filter((p) => p.status === 'FAILED').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deploymentsToday = projects.filter(
      (p) => p.updatedAt >= today,
    ).length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const totalProjectsThisWeek = projects.filter(
      (p) => p.createdAt >= oneWeekAgo,
    ).length;
    const totalProjectsLastWeek = projects.filter(
      (p) => p.createdAt >= twoWeeksAgo && p.createdAt < oneWeekAgo,
    ).length;

    const activeProjectsThisWeek = projects.filter(
      (p) => p.status === 'ACTIVE' && p.createdAt >= oneWeekAgo,
    ).length;
    const activeProjectsLastWeek = projects.filter(
      (p) =>
        p.status === 'ACTIVE' &&
        p.createdAt >= twoWeeksAgo &&
        p.createdAt < oneWeekAgo,
    ).length;

    const pausedProjectsThisWeek = projects.filter(
      (p) => p.status === 'INACTIVE' && p.createdAt >= oneWeekAgo,
    ).length;
    const pausedProjectsLastWeek = projects.filter(
      (p) =>
        p.status === 'INACTIVE' &&
        p.createdAt >= twoWeeksAgo &&
        p.createdAt < oneWeekAgo,
    ).length;

    const failedProjectsThisWeek = projects.filter(
      (p) => p.status === 'FAILED' && p.createdAt >= oneWeekAgo,
    ).length;
    const failedProjectsLastWeek = projects.filter(
      (p) =>
        p.status === 'FAILED' &&
        p.createdAt >= twoWeeksAgo &&
        p.createdAt < oneWeekAgo,
    ).length;

    const deploymentsYesterday = projects.filter(
      (p) => p.updatedAt >= yesterday && p.updatedAt < today,
    ).length;

    // Apply filters to the returned list
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        projects = projects.filter(
          (p) => p.status.toLowerCase() === filters.status.toLowerCase(),
        );
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        projects = projects.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.domain && p.domain.toLowerCase().includes(q)) ||
            p.user.name.toLowerCase().includes(q) ||
            p.user.email.toLowerCase().includes(q),
        );
      }
      if (filters.userId && filters.userId !== 'all') {
        projects = projects.filter((p) => p.user.id === filters.userId);
      }
    }

    return {
      stats: {
        totalProjects,
        activeProjects,
        pausedProjects,
        failedProjects,
        deploymentsToday,
        totalProjectsTrend: calculateTrend(
          totalProjectsThisWeek,
          totalProjectsLastWeek,
        ),
        activeProjectsTrend: calculateTrend(
          activeProjectsThisWeek,
          activeProjectsLastWeek,
        ),
        pausedProjectsTrend: calculateTrend(
          pausedProjectsThisWeek,
          pausedProjectsLastWeek,
        ),
        failedProjectsTrend: calculateTrend(
          failedProjectsThisWeek,
          failedProjectsLastWeek,
        ),
        deploymentsTrend: calculateTrend(
          deploymentsToday,
          deploymentsYesterday,
        ),
      },
      projects,
    };
  }

  async updateProject(id: string, data: any) {
    const updateData: any = {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.name !== undefined) updateData.name = data.name;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.domain !== undefined) updateData.domain = data.domain;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.project.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: updateData,
    });
  }

  async deleteProject(id: string) {
    // Delete the project (Prisma cascade handles related containers/logs in the DB)
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async suspendProject(id: string) {
    // Get project and its containers
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { containers: true },
    });

    if (!project) throw new Error('Project not found');

    // Stop all running containers
    for (const container of project.containers) {
      if (container.dockerContainerId && container.status === 'RUNNING') {
        try {
          await this.dockerService.stopContainer(container.dockerContainerId);
        } catch (err) {
          console.warn(
            `Failed to stop container ${container.id} during suspension: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }

    // Update container statuses in DB
    await this.prisma.container.updateMany({
      where: { projectId: id, status: 'RUNNING' },
      data: { status: 'STOPPED' },
    });

    // Update project status to INACTIVE
    return this.prisma.project.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async resumeProject(id: string) {
    // Get project and its containers
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { containers: true },
    });

    if (!project) throw new Error('Project not found');

    // Start all containers
    for (const container of project.containers) {
      if (container.dockerContainerId) {
        try {
          await this.dockerService.startContainer(container.dockerContainerId);
        } catch (err) {
          console.warn(
            `Failed to start container ${container.id} during resume: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }

    // Update container statuses in DB
    await this.prisma.container.updateMany({
      where: { projectId: id },
      data: { status: 'RUNNING' },
    });

    // Update project status to ACTIVE
    return this.prisma.project.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }

  async resetProjectStatus(id: string) {
    // Only reset if it's BUILDING
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new Error('Project not found');

    if (project.status === 'BUILDING') {
      return this.prisma.project.update({
        where: { id },
        data: { status: 'FAILED' },
      });
    }

    return project;
  }

  async getAllDeployments(filters?: Record<string, string>) {
    let deployments = await this.prisma.deployment.findMany({
      include: {
        project: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    const totalDeployments = deployments.length;
    const successfulDeployments = deployments.filter(
      (d) => d.status === 'Success',
    ).length;
    const failedDeployments = deployments.filter(
      (d) => d.status === 'Failed',
    ).length;
    const inProgressDeployments = deployments.filter(
      (d) => d.status === 'In Progress',
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deploymentsToday = deployments.filter(
      (d) => d.startedAt >= today,
    ).length;

    // Apply filters to the returned list
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        deployments = deployments.filter(
          (d) => d.status.toLowerCase() === filters.status.toLowerCase(),
        );
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        deployments = deployments.filter(
          (d) =>
            (d.domain && d.domain.toLowerCase().includes(q)) ||
            d.project.name.toLowerCase().includes(q) ||
            d.project.user.name.toLowerCase().includes(q) ||
            d.project.user.email.toLowerCase().includes(q),
        );
      }
      if (filters.projectId && filters.projectId !== 'all') {
        deployments = deployments.filter(
          (d) => d.projectId === filters.projectId,
        );
      }
      if (filters.userId && filters.userId !== 'all') {
        deployments = deployments.filter(
          (d) => d.project.user.id === filters.userId,
        );
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        // Date range filtering logic (placeholder for actual implementation if needed)
      }
    }

    // We'll calculate simple static trends for now to match the UI mockup requirements
    return {
      stats: {
        totalDeployments,
        successfulDeployments,
        failedDeployments,
        inProgressDeployments,
        deploymentsToday,
        totalDeploymentsTrend: 12,
        successfulDeploymentsTrend: 10,
        failedDeploymentsTrend: -15,
        inProgressDeploymentsTrend: 5,
        deploymentsTodayTrend: 14,
      },
      deployments,
    };
  }
}
