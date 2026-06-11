import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
  ) {}

  async create(userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        deploymentType: dto.deploymentType,
        repositoryUrl: dto.repositoryUrl,
        domain: dto.domain,
      },
      include: { containers: true },
    });

    await this.activityLogs.create({
      userId,
      projectId: project.id,
      action: 'PROJECT_CREATED',
      description: `Project "${project.name}" created`,
    });

    return project;
  }

  async findAll(
    userId: string,
    search?: string,
    status?: string,
    page = 1,
    limit = 10,
  ) {
    const where: any = { userId };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      where.status = status;
    }

    const [total, projects] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        include: { containers: { select: { id: true, status: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        containers: true,
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException();

    return project;
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.findOne(id, userId);

    const project = await this.prisma.project.update({
      where: { id },
      data: dto,
    });

    await this.activityLogs.create({
      userId,
      projectId: id,
      action: 'PROJECT_UPDATED',
      description: `Project "${project.name}" updated`,
    });

    return project;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.project.delete({ where: { id } });

    await this.activityLogs.create({
      userId,
      action: 'PROJECT_DELETED',
      description: `Project deleted`,
    });

    return { message: 'Project deleted successfully' };
  }

  async getStats(userId: string) {
    const [totalProjects, totalContainers, runningContainers, totalDeployments] =
      await Promise.all([
        this.prisma.project.count({ where: { userId } }),
        this.prisma.container.count({
          where: { project: { userId } },
        }),
        this.prisma.container.count({
          where: { project: { userId }, status: 'RUNNING' },
        }),
        this.prisma.activityLog.count({
          where: { userId, action: { in: ['DEPLOYMENT_SUCCESS', 'DEPLOYMENT_STARTED'] } },
        }),
      ]);

    return {
      totalProjects,
      totalContainers,
      runningContainers,
      totalDeployments,
    };
  }
}
