import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { DockerService } from '../docker/docker.service';
import { NginxService } from '../nginx/nginx.service';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
    private docker: DockerService,
    private nginx: NginxService,
    private configService: ConfigService,
  ) {}

  async create(userId: string, dto: CreateProjectDto, ip?: string) {
    let domain = dto.domain;

    if (!domain) {
      const baseDomain = this.configService.get<string>('BASE_DOMAIN');
      if (baseDomain) {
        const slug = dto.name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        let potentialDomain = `${slug}.${baseDomain}`;

        const existing = await this.prisma.project.findFirst({
          where: { domain: potentialDomain },
        });
        if (existing) {
          const suffix = randomBytes(2).toString('hex');
          potentialDomain = `${slug}-${suffix}.${baseDomain}`;
        }
        domain = potentialDomain;
      }
    }

    const project = await this.prisma.project.create({
      data: {
        ...(dto as any),
        domain,
        userId,
      },
      include: { containers: true },
    });

    await this.activityLogs.create({
      userId,
      projectId: project.id,
      action: 'PROJECT_CREATED',
      description: `Project "${project.name}" created`,
      ipAddress: ip,
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

  async update(id: string, userId: string, dto: UpdateProjectDto, ip?: string) {
    const oldProject = await this.findOne(id, userId);

    const project = await this.prisma.project.update({
      where: { id },
      data: dto as any,
    });

    await this.activityLogs.create({
      userId,
      projectId: id,
      action: 'PROJECT_UPDATED',
      description: `Project "${project.name}" updated`,
      ipAddress: ip,
    });

    if (dto.domain && dto.domain !== oldProject.domain) {
      const activeContainer = oldProject.containers.find((c: any) => c.status === 'RUNNING' && c.hostPort);
      if (activeContainer && activeContainer.hostPort) {
        await this.nginx.generateHttpConfig(dto.domain, activeContainer.hostPort);
      }
    }

    return project;
  }

  async remove(id: string, userId: string, ip?: string) {
    const project = await this.findOne(id, userId);

    for (const container of project.containers) {
      try {
        if (container.dockerContainerId) {
          const dockerContainer = await this.docker.getContainer(
            container.dockerContainerId,
          );
          await dockerContainer.stop().catch(() => {});
          await dockerContainer.remove({ force: true }).catch(() => {});
        }
        if (container.imageName) {
          const imageTag = container.imageTag || 'latest';
          const fullImageName = `${container.imageName}:${imageTag}`;
          await this.docker.removeImage(fullImageName).catch(() => {});
        }
      } catch (err) {
        this.logger.warn(
          `Failed to cleanup docker container ${container.dockerContainerId}: ${err.message}`,
        );
      }
    }

    if (project.domain) {
      await this.nginx.removeConfig(project.domain).catch(() => {});
    }

    await this.prisma.project.delete({ where: { id } });

    await this.activityLogs.create({
      userId,
      action: 'PROJECT_DELETED',
      description: `Project deleted`,
      ipAddress: ip,
    });

    return { message: 'Project deleted successfully' };
  }

  async getStats(userId: string) {
    const [
      totalProjects,
      totalContainers,
      runningContainers,
      totalDeployments,
    ] = await Promise.all([
      this.prisma.project.count({ where: { userId } }),
      this.prisma.container.count({
        where: { project: { userId } },
      }),
      this.prisma.container.count({
        where: { project: { userId }, status: 'RUNNING' },
      }),
      this.prisma.activityLog.count({
        where: {
          userId,
          action: { in: ['DEPLOYMENT_SUCCESS', 'DEPLOYMENT_STARTED'] },
        },
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
