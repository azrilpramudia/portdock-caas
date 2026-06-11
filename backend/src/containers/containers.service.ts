import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DockerService } from '../docker/docker.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateContainerDto } from './dto/create-container.dto';

@Injectable()
export class ContainersService {
  private readonly logger = new Logger(ContainersService.name);

  constructor(
    private prisma: PrismaService,
    private docker: DockerService,
    private activityLogs: ActivityLogsService,
  ) {}

  async create(userId: string, projectId: string, dto: CreateContainerDto) {
    // Verify project ownership
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException();

    const imageTag = dto.imageTag || 'latest';
    const fullImage = `${dto.imageName}:${imageTag}`;

    // Find available host port if not provided
    let hostPort = dto.hostPort;
    if (!hostPort) {
      hostPort = await this.getAvailablePort();
    }

    try {
      // Create Docker container
      const dockerContainer = await this.docker.createContainer({
        name: dto.name,
        Image: fullImage,
        ExposedPorts: { [`${dto.internalPort}/tcp`]: {} },
        HostConfig: {
          PortBindings: {
            [`${dto.internalPort}/tcp`]: [{ HostPort: `${hostPort}` }],
          },
          RestartPolicy: { Name: 'unless-stopped' },
        },
      });

      const inspect = await dockerContainer.inspect();

      const container = await this.prisma.container.create({
        data: {
          projectId,
          dockerContainerId: inspect.Id,
          name: dto.name,
          imageName: dto.imageName,
          imageTag,
          internalPort: dto.internalPort,
          hostPort,
          subdomain: dto.subdomain,
          status: 'STOPPED',
        },
      });

      await this.activityLogs.create({
        userId,
        projectId,
        action: 'CONTAINER_CREATED',
        description: `Container "${dto.name}" created`,
      });

      return container;
    } catch (err) {
      this.logger.error('Failed to create container', err);
      throw new InternalServerErrorException(`Failed to create container: ${err.message}`);
    }
  }

  async findAll(userId: string, projectId?: string) {
    const where: any = { project: { userId } };
    if (projectId) where.projectId = projectId;

    const containers = await this.prisma.container.findMany({
      where,
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Sync status from Docker
    const enriched = await Promise.all(
      containers.map(async (c) => {
        if (!c.dockerContainerId) return { ...c, dockerStatus: null };
        try {
          const inspect = await this.docker.inspectContainer(c.dockerContainerId);
          return {
            ...c,
            dockerStatus: inspect.State.Status,
            uptime: inspect.State.StartedAt,
          };
        } catch {
          return { ...c, dockerStatus: 'removed' };
        }
      }),
    );

    return enriched;
  }

  async findOne(id: string, userId: string) {
    const container = await this.prisma.container.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true, userId: true } } },
    });

    if (!container) throw new NotFoundException('Container not found');
    if (container.project.userId !== userId) throw new ForbiddenException();

    if (container.dockerContainerId) {
      try {
        const inspect = await this.docker.inspectContainer(container.dockerContainerId);
        return { ...container, dockerInspect: inspect };
      } catch {
        return container;
      }
    }
    return container;
  }

  async start(id: string, userId: string) {
    const container = await this.findOne(id, userId);
    if (!container.dockerContainerId) throw new NotFoundException('Docker container not found');

    await this.docker.startContainer(container.dockerContainerId);
    const updated = await this.prisma.container.update({
      where: { id },
      data: { status: 'RUNNING' },
    });

    await this.activityLogs.create({
      userId,
      projectId: container.projectId,
      action: 'CONTAINER_STARTED',
      description: `Container "${container.name}" started`,
    });

    return updated;
  }

  async stop(id: string, userId: string) {
    const container = await this.findOne(id, userId);
    if (!container.dockerContainerId) throw new NotFoundException('Docker container not found');

    await this.docker.stopContainer(container.dockerContainerId);
    const updated = await this.prisma.container.update({
      where: { id },
      data: { status: 'STOPPED' },
    });

    await this.activityLogs.create({
      userId,
      projectId: container.projectId,
      action: 'CONTAINER_STOPPED',
      description: `Container "${container.name}" stopped`,
    });

    return updated;
  }

  async restart(id: string, userId: string) {
    const container = await this.findOne(id, userId);
    if (!container.dockerContainerId) throw new NotFoundException('Docker container not found');

    await this.docker.restartContainer(container.dockerContainerId);
    const updated = await this.prisma.container.update({
      where: { id },
      data: { status: 'RUNNING' },
    });

    await this.activityLogs.create({
      userId,
      projectId: container.projectId,
      action: 'CONTAINER_RESTARTED',
      description: `Container "${container.name}" restarted`,
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const container = await this.findOne(id, userId);

    if (container.dockerContainerId) {
      try {
        await this.docker.stopContainer(container.dockerContainerId);
      } catch {}
      try {
        await this.docker.removeContainer(container.dockerContainerId, true);
      } catch {}
    }

    await this.prisma.container.delete({ where: { id } });

    await this.activityLogs.create({
      userId,
      projectId: container.projectId,
      action: 'CONTAINER_DELETED',
      description: `Container "${container.name}" deleted`,
    });

    return { message: 'Container deleted successfully' };
  }

  private async getAvailablePort(): Promise<number> {
    const usedPorts = await this.prisma.container.findMany({
      select: { hostPort: true },
      where: { hostPort: { not: null } },
    });
    const used = new Set(usedPorts.map((c) => c.hostPort));
    for (let port = 8000; port <= 9999; port++) {
      if (!used.has(port)) return port;
    }
    throw new InternalServerErrorException('No available ports');
  }
}
