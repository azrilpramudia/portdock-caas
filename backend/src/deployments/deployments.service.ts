import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar-fs';
import { PrismaService } from '../prisma/prisma.service';
import { DockerService } from '../docker/docker.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ProjectStatus } from '@generated/prisma';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { NginxService } from '../nginx/nginx.service';
import { ArchiveService } from '../archive/archive.service';
import { GitService } from '../git/git.service';

@Injectable()
export class DeploymentsService {
  private readonly logger = new Logger(DeploymentsService.name);

  constructor(
    private prisma: PrismaService,
    private docker: DockerService,
    private activityLogs: ActivityLogsService,
    private config: ConfigService,
    private nginx: NginxService,
    private archive: ArchiveService,
    private git: GitService,
    private eventEmitter: EventEmitter2,
  ) {}

  async deployZip(
    userId: string,
    projectId: string,
    file: Express.Multer.File,
    memoryLimit: number = 512,
    cpuLimit: number = 1.0,
    customInternalPort?: number,
    ip?: string,
  ) {
    const project = await this.verifyProject(projectId, userId);

    const uploadDir = path.resolve(
      process.cwd(),
      this.config.get<string>('UPLOAD_DIR', './uploads'),
    );
    const extractDir = path.join(uploadDir, projectId, Date.now().toString());

    fs.mkdirSync(extractDir, { recursive: true });

    await this.activityLogs.create({
      userId,
      projectId,
      action: 'DEPLOYMENT_STARTED',
      description: `Deployment started for "${project.name}" via ZIP`,
      ipAddress: ip,
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.BUILDING },
    });

    const deployment = await this.prisma.deployment.create({
      data: {
        projectId,
        domain: project.domain,
        status: 'In Progress',
        progress: 0,
      }
    });

    try {
      await this.archive.extractAndFlatten(file.path, extractDir);

      const imageName = `portdock-${projectId}`.toLowerCase();
      const imageTag = `v${Date.now()}`;
      const dockerfilePath = path.join(extractDir, 'Dockerfile');

      if (project.templateId === 'STATIC_NGINX') {
        fs.writeFileSync(
          dockerfilePath,
          `FROM nginx:latest\nCOPY . /usr/share/nginx/html\nEXPOSE 80\n`,
        );
        this.logger.log(
          `Generated STATIC_NGINX Dockerfile for ${project.name}`,
        );
      } else if (project.templateId === 'STATIC_APACHE') {
        fs.writeFileSync(
          dockerfilePath,
          `FROM httpd:latest\nCOPY . /usr/local/apache2/htdocs/\nEXPOSE 80\n`,
        );
        this.logger.log(
          `Generated STATIC_APACHE Dockerfile for ${project.name}`,
        );
      } else if (project.templateId === 'PHP_APACHE') {
        fs.writeFileSync(
          dockerfilePath,
          `FROM php:8.2-apache\nCOPY . /var/www/html/\nEXPOSE 80\n`,
        );
        this.logger.log(`Generated PHP_APACHE Dockerfile for ${project.name}`);
      }

      if (fs.existsSync(dockerfilePath)) {
        const tarStream = tar.pack(extractDir);
        await this.docker.buildImage(tarStream, imageName, imageTag);
      } else {
        await this.docker.buildWithNixpacks(extractDir, imageName, imageTag);
      }

      // Find available port
      const hostPort = await this.getAvailablePort();
      const detectedPort = await this.docker.getExposedPort(
        `${imageName}:${imageTag}`,
      );
      const internalPort = customInternalPort || detectedPort;

      // Parse environment variables
      let dockerEnv = [`PORT=${internalPort}`];
      if (project.envVars && typeof project.envVars === 'object') {
        const envRecord = project.envVars as Record<string, string>;
        const envArray = Object.entries(envRecord).map(([k, v]) => `${k}=${v}`);
        dockerEnv = [...dockerEnv, ...envArray];
      }

      // Create Docker container
      const dockerContainer = await this.docker.createContainer({
        name: `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
        Image: `${imageName}:${imageTag}`,
        Env: dockerEnv,
        ExposedPorts: { [`${internalPort}/tcp`]: {} },
        HostConfig: {
          Memory: Math.min(memoryLimit, 512) * 1024 * 1024,
          CpuQuota: Math.floor(Math.min(cpuLimit, 1.0) * 100000),
          PortBindings: {
            [`${internalPort}/tcp`]: [{ HostPort: `${hostPort}` }],
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
      await dockerContainer.start();

      const containerName = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
      const container = await this.prisma.container.create({
        data: {
          projectId,
          dockerContainerId: inspect.Id,
          name: containerName,
          imageName,
          imageTag,
          internalPort,
          hostPort,
          status: 'RUNNING',
          memoryLimit,
          cpuLimit,
        },
      });

      await this.cleanupOldContainers(projectId, container.id);

      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.ACTIVE },
      });

      await this.activityLogs.create({
        userId,
        projectId,
        action: 'DEPLOYMENT_SUCCESS',
        description: `Deployment succeeded for "${project.name}"`,
        ipAddress: ip,
      });

      await this.prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'Success',
          progress: 100,
          endedAt: new Date(),
        },
      });

      this.eventEmitter.emit('deployment.success', {
        projectName: project.name,
        domain: project.domain,
        timeMs: new Date().getTime() - deployment.startedAt.getTime()
      });

      // Generate Nginx config if domain exists
      if (project.domain) {
        const domain = project.domain;
        const projectNameSafe = project.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const baseDomain = process.env.BASE_DOMAIN || 'portdock.my.id';
        const isSystemSubdomain = domain.endsWith(`.${baseDomain}`);
        const pathRoute = isSystemSubdomain ? projectNameSafe : domain;
        await this.nginx.generateHttpConfig(domain, hostPort, pathRoute);

        // Attempt Let's Encrypt SSL in the background!
        // Do not block the HTTP response waiting for certbot to finish.
        const userEmail = project.user?.email || 'admin@portdock.my.id';
        this.nginx
          .requestSsl(domain, userEmail)
          .then(async (sslSuccess) => {
            if (sslSuccess) {
              await this.nginx.generateHttpsConfig(domain, hostPort, pathRoute);
            }
          })
          .catch((err) => this.logger.error('Background SSL Error', err));
      }

      // Cleanup
      this.archive.cleanup(extractDir, file.path);

      return { message: 'Deployment successful', container };
    } catch (err) {
      this.logger.error('Deployment failed', err);

      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.FAILED },
      });

      await this.activityLogs.create({
        userId,
        projectId,
        action: 'DEPLOYMENT_FAILED',
        description: `Deployment failed: ${err.message}`,
        status: 'Failed',
        ipAddress: ip,
      });

      await this.prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'Failed',
          endedAt: new Date(),
        },
      });

      this.eventEmitter.emit('deployment.failed', {
        projectName: project.name,
        reason: err.message
      });

      this.archive.cleanup(extractDir, file.path);

      throw new BadRequestException(`Deployment failed: ${err.message}`);
    }
  }

  async deployGithub(
    userId: string,
    projectId: string,
    repositoryUrl: string,
    branch: string = 'main',
    memoryLimit: number = 512,
    cpuLimit: number = 1.0,
    customInternalPort?: number,
    ip?: string,
  ) {
    const project = await this.verifyProject(projectId, userId);

    const uploadDir = path.resolve(
      process.cwd(),
      this.config.get<string>('UPLOAD_DIR', './uploads'),
    );
    const cloneDir = path.join(uploadDir, projectId, `github-${Date.now()}`);

    fs.mkdirSync(path.dirname(cloneDir), { recursive: true });

    await this.activityLogs.create({
      userId,
      projectId,
      action: 'DEPLOYMENT_STARTED',
      description: `Deployment started for "${project.name}" via GitHub`,
      ipAddress: ip,
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.BUILDING, repositoryUrl },
    });

    const deployment = await this.prisma.deployment.create({
      data: {
        projectId,
        domain: project.domain,
        status: 'In Progress',
        progress: 0,
      }
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { sshPrivateKey: true, githubToken: true },
    });

    try {
      // Clone repository
      this.git.cloneRepository(repositoryUrl, branch, cloneDir, {
        sshPrivateKey: user?.sshPrivateKey,
        githubToken: user?.githubToken,
      });

      const dockerfilePath = path.join(cloneDir, 'Dockerfile');
      const imageName = `portdock-${projectId}`.toLowerCase();
      const imageTag = `v${Date.now()}`;

      if (project.templateId === 'STATIC_NGINX') {
        fs.writeFileSync(
          dockerfilePath,
          `FROM nginx:latest\nCOPY . /usr/share/nginx/html\nEXPOSE 80\n`,
        );
        this.logger.log(
          `Generated STATIC_NGINX Dockerfile for ${project.name}`,
        );
      } else if (project.templateId === 'STATIC_APACHE') {
        fs.writeFileSync(
          dockerfilePath,
          `FROM httpd:latest\nCOPY . /usr/local/apache2/htdocs/\nEXPOSE 80\n`,
        );
        this.logger.log(
          `Generated STATIC_APACHE Dockerfile for ${project.name}`,
        );
      } else if (project.templateId === 'PHP_APACHE') {
        fs.writeFileSync(
          dockerfilePath,
          `FROM php:8.2-apache\nCOPY . /var/www/html/\nEXPOSE 80\n`,
        );
        this.logger.log(`Generated PHP_APACHE Dockerfile for ${project.name}`);
      }

      if (fs.existsSync(dockerfilePath)) {
        const tarStream = tar.pack(cloneDir);
        await this.docker.buildImage(tarStream, imageName, imageTag);
      } else {
        await this.docker.buildWithNixpacks(cloneDir, imageName, imageTag);
      }

      const hostPort = await this.getAvailablePort();
      const detectedPort = await this.docker.getExposedPort(
        `${imageName}:${imageTag}`,
      );
      const internalPort = customInternalPort || detectedPort;

      // Parse environment variables
      let dockerEnv = [`PORT=${internalPort}`];
      if (project.envVars && typeof project.envVars === 'object') {
        const envRecord = project.envVars as Record<string, string>;
        const envArray = Object.entries(envRecord).map(([k, v]) => `${k}=${v}`);
        dockerEnv = [...dockerEnv, ...envArray];
      }

      const containerName = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
      const dockerContainer = await this.docker.createContainer({
        name: containerName,
        Image: `${imageName}:${imageTag}`,
        Env: dockerEnv,
        ExposedPorts: { [`${internalPort}/tcp`]: {} },
        HostConfig: {
          Memory: Math.min(memoryLimit, 512) * 1024 * 1024,
          CpuQuota: Math.floor(Math.min(cpuLimit, 1.0) * 100000),
          PortBindings: {
            [`${internalPort}/tcp`]: [{ HostPort: `${hostPort}` }],
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
      await dockerContainer.start();

      const container = await this.prisma.container.create({
        data: {
          projectId,
          dockerContainerId: inspect.Id,
          name: containerName,
          imageName,
          imageTag,
          internalPort,
          hostPort,
          status: 'RUNNING',
          memoryLimit: Math.min(memoryLimit, 512),
          cpuLimit: Math.min(cpuLimit, 1.0),
        },
      });

      await this.cleanupOldContainers(projectId, container.id);

      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.ACTIVE },
      });

      await this.activityLogs.create({
        userId,
        projectId,
        action: 'DEPLOYMENT_SUCCESS',
        description: `GitHub deployment succeeded for "${project.name}"`,
        ipAddress: ip,
      });

      await this.prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'Success',
          progress: 100,
          endedAt: new Date(),
        },
      });

      this.eventEmitter.emit('deployment.success', {
        projectName: project.name,
        domain: project.domain,
        timeMs: new Date().getTime() - deployment.startedAt.getTime()
      });

      // Generate Nginx config if domain exists
      if (project.domain) {
        const domain = project.domain;
        const projectNameSafe = project.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const baseDomain = process.env.BASE_DOMAIN || 'portdock.my.id';
        const isSystemSubdomain = domain.endsWith(`.${baseDomain}`);
        const pathRoute = isSystemSubdomain ? projectNameSafe : domain;
        await this.nginx.generateHttpConfig(domain, hostPort, pathRoute);

        // Attempt Let's Encrypt SSL in the background!
        const userEmail = project.user?.email || 'admin@portdock.my.id';
        this.nginx
          .requestSsl(domain, userEmail)
          .then(async (sslSuccess) => {
            if (sslSuccess) {
              await this.nginx.generateHttpsConfig(domain, hostPort, pathRoute);
            }
          })
          .catch((err) => this.logger.error('Background SSL Error', err));
      }

      this.archive.cleanup(cloneDir);

      return { message: 'GitHub deployment successful', container };
    } catch (err) {
      this.logger.error('GitHub deployment failed', err);

      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.FAILED },
      });

      await this.activityLogs.create({
        userId,
        projectId,
        action: 'DEPLOYMENT_FAILED',
        description: `GitHub deployment failed: ${err.message}`,
        status: 'Failed',
        ipAddress: ip,
      });

      await this.prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'Failed',
          endedAt: new Date(),
        },
      });

      this.eventEmitter.emit('deployment.failed', {
        projectName: project.name,
        reason: err.message
      });

      this.archive.cleanup(cloneDir);

      throw new BadRequestException(`Deployment failed: ${err.message}`);
    }
  }

  async deployDockerfile(
    userId: string,
    projectId: string,
    file: Express.Multer.File,
    memoryLimit: number = 512,
    cpuLimit: number = 1.0,
    customInternalPort?: number,
    ip?: string,
  ) {
    const project = await this.verifyProject(projectId, userId);

    const uploadDir = path.resolve(
      process.cwd(),
      this.config.get<string>('UPLOAD_DIR', './uploads'),
    );
    const extractDir = path.join(
      uploadDir,
      projectId,
      `dockerfile-${Date.now()}`,
    );

    fs.mkdirSync(extractDir, { recursive: true });

    await this.activityLogs.create({
      userId,
      projectId,
      action: 'DEPLOYMENT_STARTED',
      description: `Deployment started for "${project.name}" via Custom Dockerfile`,
      ipAddress: ip,
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.BUILDING },
    });

    const deployment = await this.prisma.deployment.create({
      data: {
        projectId,
        domain: project.domain,
        status: 'In Progress',
        progress: 0,
      }
    });

    try {
      // Move uploaded Dockerfile to extractDir
      const destPath = path.join(extractDir, 'Dockerfile');
      fs.copyFileSync(file.path, destPath);

      const imageName = `portdock-${projectId}`.toLowerCase();
      const imageTag = `v${Date.now()}`;

      // Build Image
      const tarStream = tar.pack(extractDir);
      await this.docker.buildImage(tarStream, imageName, imageTag);

      // Find available port
      const hostPort = await this.getAvailablePort();
      const detectedPort = await this.docker.getExposedPort(
        `${imageName}:${imageTag}`,
      );
      const internalPort = customInternalPort || detectedPort;

      // Parse environment variables
      let dockerEnv = [`PORT=${internalPort}`];
      if (project.envVars && typeof project.envVars === 'object') {
        const envRecord = project.envVars as Record<string, string>;
        const envArray = Object.entries(envRecord).map(([k, v]) => `${k}=${v}`);
        dockerEnv = [...dockerEnv, ...envArray];
      }

      // Create Docker container
      const dockerContainer = await this.docker.createContainer({
        name: `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
        Image: `${imageName}:${imageTag}`,
        Env: dockerEnv,
        ExposedPorts: { [`${internalPort}/tcp`]: {} },
        HostConfig: {
          Memory: Math.min(memoryLimit, 512) * 1024 * 1024,
          CpuQuota: Math.floor(Math.min(cpuLimit, 1.0) * 100000),
          PortBindings: {
            [`${internalPort}/tcp`]: [{ HostPort: `${hostPort}` }],
          },
          RestartPolicy: { Name: 'always' },
        },
      });

      const inspect = await dockerContainer.inspect();
      await dockerContainer.start();

      const containerName = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
      const container = await this.prisma.container.create({
        data: {
          projectId,
          dockerContainerId: inspect.Id,
          name: containerName,
          imageName,
          imageTag,
          internalPort,
          hostPort,
          status: 'RUNNING',
          memoryLimit,
          cpuLimit,
        },
      });

      await this.cleanupOldContainers(projectId, container.id);

      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.ACTIVE },
      });

      await this.activityLogs.create({
        userId,
        projectId,
        action: 'DEPLOYMENT_SUCCESS',
        description: `Custom Dockerfile deployment completed successfully for "${project.name}"`,
        ipAddress: ip,
      });

      await this.prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'Success',
          progress: 100,
          endedAt: new Date(),
        },
      });

      this.eventEmitter.emit('deployment.success', {
        projectName: project.name,
        domain: project.domain,
        timeMs: new Date().getTime() - deployment.startedAt.getTime()
      });

      if (project.domain) {
        const domain = project.domain;
        const projectNameSafe = project.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const baseDomain = process.env.BASE_DOMAIN || 'portdock.my.id';
        const isSystemSubdomain = domain.endsWith(`.${baseDomain}`);
        const pathRoute = isSystemSubdomain ? projectNameSafe : domain;
        await this.nginx.generateHttpConfig(domain, hostPort, pathRoute);

        const userEmail = project.user?.email || 'admin@portdock.my.id';
        this.nginx
          .requestSsl(domain, userEmail)
          .then(async (sslSuccess) => {
            if (sslSuccess) {
              await this.nginx.generateHttpsConfig(domain, hostPort, pathRoute);
            }
          })
          .catch((err) => this.logger.error('Background SSL Error', err));
      }

      this.archive.cleanup(extractDir, file.path);

      return {
        message: 'Deployment successful',
        container: dockerContainer.id,
      };
    } catch (err) {
      this.logger.error('Custom Dockerfile deployment failed', err);

      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.FAILED },
      });

      await this.activityLogs.create({
        userId,
        projectId,
        action: 'DEPLOYMENT_FAILED',
        description: `Custom Dockerfile deployment failed: ${err.message}`,
        status: 'Failed',
        ipAddress: ip,
      });

      await this.prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'Failed',
          endedAt: new Date(),
        },
      });

      this.eventEmitter.emit('deployment.failed', {
        projectName: project.name,
        reason: err.message
      });

      this.archive.cleanup(extractDir, file.path);

      throw new BadRequestException(`Deployment failed: ${err.message}`);
    }
  }

  private async verifyProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { user: { select: { email: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException();
    return project;
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
    throw new Error('No available ports');
  }

  private async cleanupOldContainers(
    projectId: string,
    excludeContainerId: string,
  ) {
    try {
      const oldContainers = await this.prisma.container.findMany({
        where: {
          projectId,
          id: { not: excludeContainerId },
        },
      });

      for (const old of oldContainers) {
        if (old.dockerContainerId) {
          try {
            await this.docker.removeContainer(old.dockerContainerId, true);
            this.logger.log(
              `Cleaned up old container ${old.dockerContainerId}`,
            );
            if (old.imageName && old.imageTag) {
              await this.docker.removeImage(`${old.imageName}:${old.imageTag}`);
            }
          } catch (e) {
            this.logger.error(
              `Failed to remove old docker container or image: ${e.message}`,
            );
          }
        }
        await this.prisma.container.delete({ where: { id: old.id } });
      }
    } catch (err) {
      this.logger.error(
        `Error during cleanup of old containers: ${err.message}`,
      );
    }
  }
}
