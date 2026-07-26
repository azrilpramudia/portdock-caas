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
import { UpdateResourcesDto } from './dto/update-resources.dto';
import { NginxService } from '../nginx/nginx.service';

@Injectable()
export class ContainersService {
  private readonly logger = new Logger(ContainersService.name);

  constructor(
    private prisma: PrismaService,
    private docker: DockerService,
    private activityLogs: ActivityLogsService,
    private nginx: NginxService,
  ) {}

  async create(
    userId: string,
    projectId: string,
    dto: CreateContainerDto,
    ip?: string,
  ) {
    // Verify project ownership
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
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
          NetworkMode: 'portdock-net',
          Memory: (dto.memoryLimit || 512) * 1024 * 1024,
          CpuQuota: Math.floor((dto.cpuLimit || 0.5) * 100000),
          PortBindings: {
            [`${dto.internalPort}/tcp`]: [{ HostPort: `${hostPort}` }],
          },
          RestartPolicy: { Name: 'unless-stopped' },
          LogConfig: {
            Type: 'json-file',
            Config: {
              'max-size': '10m',
              'max-file': '3',
            },
          },
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
          memoryLimit: dto.memoryLimit || 512,
          cpuLimit: dto.cpuLimit || 0.5,
        },
      });

      await this.activityLogs.create({
        userId,
        projectId,
        action: 'CONTAINER_CREATED',
        description: `Container "${dto.name}" created`,
        ipAddress: ip,
      });

      return container;
    } catch (err) {
      this.logger.error('Failed to create container', err);
      throw new InternalServerErrorException(
        `Failed to create container: ${err.message}`,
      );
    }
  }

  async findAll(userId: string, projectId?: string) {
    const where: any = { project: { userId } };
    if (projectId) where.projectId = projectId;

    const containers = await this.prisma.container.findMany({
      where,
      include: { project: { select: { id: true, name: true, domain: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Sync status from Docker
    const enriched = await Promise.all(
      containers.map(async (c) => {
        if (!c.dockerContainerId) return { ...c, dockerStatus: null };
        try {
          const inspect = await this.docker.inspectContainer(
            c.dockerContainerId,
          );
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

  async findOne(id: string, userId: string, isAdmin: boolean = false) {
    const container = await this.prisma.container.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, userId: true, domain: true },
        },
      },
    });

    if (!container) throw new NotFoundException('Container not found');
    if (!isAdmin && container.project.userId !== userId) throw new ForbiddenException();

    if (container.dockerContainerId) {
      try {
        const inspect = await this.docker.inspectContainer(
          container.dockerContainerId,
        );
        return { ...container, dockerInspect: inspect };
      } catch {
        return container;
      }
    }
    return container;
  }

  async start(id: string, userId: string, ip?: string) {
    const container = await this.findOne(id, userId);
    if (!container.dockerContainerId)
      throw new NotFoundException('Docker container not found');

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
      ipAddress: ip,
    });

    return updated;
  }

  async stop(id: string, userId: string, ip?: string) {
    const container = await this.findOne(id, userId);
    if (!container.dockerContainerId)
      throw new NotFoundException('Docker container not found');

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
      ipAddress: ip,
    });

    return updated;
  }

  async restart(id: string, userId: string, ip?: string) {
    const container = await this.findOne(id, userId);
    if (!container.dockerContainerId)
      throw new NotFoundException('Docker container not found');

    let dockerContainerId = container.dockerContainerId;
    let recreateFailed = false;
    let inspectFailed = false;
    let currentHostPort = null;

    try {
      const inspect = await this.docker.inspectContainer(dockerContainerId);
      const bindings =
        inspect.HostConfig?.PortBindings?.[`${container.internalPort}/tcp`];
      currentHostPort = bindings ? bindings[0]?.HostPort : null;
    } catch (err) {
      if (err.statusCode === 404) {
        // Container is completely missing in Docker engine (zombie state)
        this.logger.warn(
          `Container ${dockerContainerId} missing in Docker, forcing recreation.`,
        );
        inspectFailed = true;
      } else {
        this.logger.error(`Failed to inspect container: ${err.message}`);
        recreateFailed = true;
      }
    }

    if (!recreateFailed) {
      try {
        const expectedHostPort = container.hostPort
          ? String(container.hostPort)
          : null;

        if (currentHostPort !== expectedHostPort || inspectFailed) {
          // Port mapping changed OR container is missing, we must recreate
          if (!inspectFailed) {
            await this.docker.stopContainer(dockerContainerId).catch(() => {});
            await this.docker
              .removeContainer(dockerContainerId, true)
              .catch(() => {});
          }

          const imageTag = container.imageTag || 'latest';
          const fullImage = `${container.imageName}:${imageTag}`;

          const volumeName = container.volumeMountPath
            ? `portdock-vol-${container.id}`
            : undefined;
          const binds = volumeName
            ? [`${volumeName}:${container.volumeMountPath}`]
            : [];

          // Build port bindings only if a hostPort exists
          const portBindings = container.hostPort
            ? {
                [`${container.internalPort}/tcp`]: [
                  { HostPort: `${container.hostPort}` },
                ],
              }
            : {};

          const newDockerContainer = await this.docker.createContainer({
            name: container.name,
            Image: fullImage,
            ExposedPorts: { [`${container.internalPort}/tcp`]: {} },
            HostConfig: {
              NetworkMode: 'portdock-net',
              PortBindings: portBindings,
              RestartPolicy: {
                Name: container.restartPolicy || 'unless-stopped',
              },
              Binds: binds,
              Memory: container.memoryLimit
                ? Math.floor(container.memoryLimit * 1024 * 1024)
                : 0,
              MemorySwap: container.memoryLimit
                ? Math.floor(container.memoryLimit * 1024 * 1024)
                : 0,
              NanoCpus: container.cpuLimit
                ? Math.floor(container.cpuLimit * 1e9)
                : 0,
              LogConfig: {
                Type: 'json-file',
                Config: {
                  'max-size': '10m',
                  'max-file': '3',
                },
              },
            },
          });

          dockerContainerId = newDockerContainer.id;
          await this.prisma.container.update({
            where: { id: container.id },
            data: { dockerContainerId },
          });

          // Update Nginx config if the container's host port changed and it is attached to a domain
          if (container.hostPort) {
            const project = await this.prisma.project.findUnique({ where: { id: container.projectId } });
            if (project?.domain) {
              await this.nginx.generateHttpConfig(project.domain, container.hostPort);
              await this.nginx.generateHttpsConfig(project.domain, container.hostPort).catch(() => {});
            }
          }
        }
      } catch (err) {
        this.logger.error(
          `Failed to recreate container during restart: ${err.message}`,
        );
        recreateFailed = true;
      }
    }

    if (!recreateFailed) {
      await this.docker.restartContainer(dockerContainerId);
      const updated = await this.prisma.container.update({
        where: { id },
        data: { status: 'RUNNING' },
      });
      
      // Always sync Nginx config on restart to prevent out-of-sync errors
      if (updated.hostPort) {
        const project = await this.prisma.project.findUnique({ where: { id: updated.projectId } });
        if (project?.domain) {
          await this.nginx.generateHttpConfig(project.domain, updated.hostPort);
          await this.nginx.generateHttpsConfig(project.domain, updated.hostPort).catch(() => {});
        }
      }

      await this.activityLogs.create({
        userId,
        projectId: container.projectId,
        action: 'CONTAINER_RESTARTED',
        description: `Container "${container.name}" restarted`,
        ipAddress: ip,
      });

      return updated;
    } else {
      throw new InternalServerErrorException(
        'Failed to restart container due to configuration error',
      );
    }
  }

  async remove(id: string, userId: string, ip?: string) {
    const container = await this.findOne(id, userId);

    if (container.dockerContainerId) {
      try {
        await this.docker.stopContainer(container.dockerContainerId);
      } catch {}
      try {
        await this.docker.removeContainer(container.dockerContainerId, true);
      } catch {}
    }

    // Attempt to remove the image as well to prevent server bloat
    if (container.imageName) {
      try {
        const imageTag = container.imageTag || 'latest';
        const fullImageName = `${container.imageName}:${imageTag}`;
        await this.docker.removeImage(fullImageName);
      } catch {}
    }

    await this.prisma.container.delete({ where: { id } });

    await this.activityLogs.create({
      userId,
      projectId: container.projectId,
      action: 'CONTAINER_DELETED',
      description: `Container "${container.name}" deleted`,
      ipAddress: ip,
    });

    return { message: 'Container deleted successfully' };
  }

  async updateResources(
    id: string,
    userId: string,
    dto: UpdateResourcesDto,
    ip?: string,
    isAdmin: boolean = false
  ) {
    const container = await this.findOne(id, userId, isAdmin);

    // Convert memory (MB) to bytes and CPU (cores) to nanoCPUs
    const memoryBytes = dto.memoryLimit
      ? Math.floor(dto.memoryLimit * 1024 * 1024)
      : 0;
    const cpuQuota = dto.cpuLimit ? Math.floor(dto.cpuLimit * 100000) : 0;

    const volumeChanged =
      dto.volumeMountPath !== undefined &&
      dto.volumeMountPath !== container.volumeMountPath;
    const internalPortChanged =
      dto.internalPort !== undefined &&
      dto.internalPort !== container.internalPort;

    if ((volumeChanged || internalPortChanged) && container.dockerContainerId) {
      const volumeName = `portdock-vol-${container.id}`;
      let binds: string[] = [];

      if (dto.volumeMountPath) {
        await this.docker.createVolume(volumeName);
        binds = [`${volumeName}:${dto.volumeMountPath}`];
      }

      try {
        await this.docker.stopContainer(container.dockerContainerId);
      } catch {}
      try {
        await this.docker.removeContainer(container.dockerContainerId, true);
      } catch {}
      // Fallback: also try to remove by name to clear any orphaned containers blocking the name
      try {
        await this.docker.removeContainer(container.name, true);
      } catch {}

      const imageTag = container.imageTag || 'latest';
      const fullImage = `${container.imageName}:${imageTag}`;
      const newInternalPort = dto.internalPort || container.internalPort;

      const portBindings = container.hostPort
        ? {
            [`${newInternalPort}/tcp`]: [{ HostPort: `${container.hostPort}` }],
          }
        : {};

      const newDockerContainer = await this.docker.createContainer({
        name: container.name,
        Image: fullImage,
        ExposedPorts: { [`${newInternalPort}/tcp`]: {} },
        HostConfig: {
          NetworkMode: 'portdock-net',
          PortBindings: portBindings,
          RestartPolicy: {
            Name:
              dto.restartPolicy || container.restartPolicy || 'unless-stopped',
          },
          Binds: binds,
          Memory: memoryBytes,
          MemorySwap: memoryBytes,
          CpuQuota: cpuQuota,
          LogConfig: {
            Type: 'json-file',
            Config: {
              'max-size': '10m',
              'max-file': '3',
            },
          },
        },
      });

      if (container.status === 'RUNNING') {
        await this.docker.startContainer(newDockerContainer.id);
      }

      await this.prisma.container.update({
        where: { id: container.id },
        data: { dockerContainerId: newDockerContainer.id },
      });
    } else if (container.dockerContainerId) {
      try {
        const dockerContainer = await this.docker.getContainer(
          container.dockerContainerId,
        );
        const updateOptions: any = {
          Memory: memoryBytes,
          MemorySwap: memoryBytes, // Set swap equal to memory to prevent swapping (or customize as needed)
          CpuQuota: cpuQuota,
        };

        if (dto.restartPolicy) {
          updateOptions.RestartPolicy = { Name: dto.restartPolicy };
        }

        await dockerContainer.update(updateOptions);
      } catch (err) {
        this.logger.error(
          `Failed to update docker container resources: ${err.message}`,
          err.stack,
        );
        throw new InternalServerErrorException(
          `Failed to update docker container resources: ${err.message}`,
        );
      }
    }

    const updateData: any = {
      memoryLimit: dto.memoryLimit,
      cpuLimit: dto.cpuLimit,
    };
    if (dto.restartPolicy !== undefined) {
      updateData.restartPolicy = dto.restartPolicy;
    }
    if (dto.volumeMountPath !== undefined) {
      updateData.volumeMountPath = dto.volumeMountPath;
    }
    if (dto.internalPort !== undefined) {
      updateData.internalPort = dto.internalPort;
    }

    const updated = await this.prisma.container.update({
      where: { id },
      data: updateData,
    });

    await this.activityLogs.create({
      userId,
      projectId: container.projectId,
      action: 'CONTAINER_RESOURCES_UPDATED',
      description: `Updated resources for container "${container.name}" (RAM: ${dto.memoryLimit || 'Unlimited'}MB, CPU: ${dto.cpuLimit || 'Unlimited'} Cores)`,
      ipAddress: ip,
    });

    return updated;
  }

  async allocatePort(id: string, userId: string, port: number, ip?: string) {
    const container = await this.findOne(id, userId);

    if (port < 19000 || port > 25999) {
      throw new ForbiddenException('Port must be between 19000 and 25999');
    }

    // Check if port is taken
    const existing = await this.prisma.container.findFirst({
      where: { hostPort: port },
    });

    if (existing && existing.id !== container.id) {
      throw new ForbiddenException(
        'Port is already in use by another container',
      );
    }

    const updated = await this.prisma.container.update({
      where: { id },
      data: { hostPort: port },
    });

    if (container.hostPort !== port) {
      const project = await this.prisma.project.findUnique({ where: { id: container.projectId } });
      if (project?.domain) {
        await this.nginx.generateHttpConfig(project.domain, port);
        await this.nginx.generateHttpsConfig(project.domain, port).catch(() => {});
      }
    }

    await this.activityLogs.create({
      userId,
      projectId: container.projectId,
      action: 'CONTAINER_PORT_ALLOCATED',
      description: `Allocated external port ${port} for container "${container.name}"`,
      ipAddress: ip,
    });

    return updated;
  }

  async removePort(id: string, userId: string, ip?: string) {
    const container = await this.findOne(id, userId);

    const updated = await this.prisma.container.update({
      where: { id },
      data: { hostPort: null },
    });

    await this.activityLogs.create({
      userId,
      projectId: container.projectId,
      action: 'CONTAINER_PORT_REMOVED',
      description: `Removed external port for container "${container.name}"`,
      ipAddress: ip,
    });

    return updated;
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
