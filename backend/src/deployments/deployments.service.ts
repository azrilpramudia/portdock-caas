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
  ) {}

  async deployZip(
    userId: string,
    projectId: string,
    file: Express.Multer.File,
  ) {
    const project = await this.verifyProject(projectId, userId);

    const uploadDir = path.resolve(process.cwd(), this.config.get<string>('UPLOAD_DIR', './uploads'));
    const extractDir = path.join(uploadDir, projectId, Date.now().toString());

    fs.mkdirSync(extractDir, { recursive: true });

    await this.activityLogs.create({
      userId,
      projectId,
      action: 'DEPLOYMENT_STARTED',
      description: `Deployment started for "${project.name}" via ZIP`,
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.BUILDING },
    });

    try {
      await this.archive.extractAndFlatten(file.path, extractDir);

      const imageName = `portdock-${projectId}`.toLowerCase();
      const imageTag = `v${Date.now()}`;
      const dockerfilePath = path.join(extractDir, 'Dockerfile');

      if (fs.existsSync(dockerfilePath)) {
        const tarStream = tar.pack(extractDir);
        await this.docker.buildImage(tarStream, imageName, imageTag);
      } else {
        await this.docker.buildWithNixpacks(extractDir, imageName, imageTag);
      }

      // Find available port
      const hostPort = await this.getAvailablePort();
      const internalPort = await this.docker.getExposedPort(`${imageName}:${imageTag}`);

      // Create Docker container
      const dockerContainer = await this.docker.createContainer({
        name: `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
        Image: `${imageName}:${imageTag}`,
        ExposedPorts: { [`${internalPort}/tcp`]: {} },
        HostConfig: {
          PortBindings: {
            [`${internalPort}/tcp`]: [{ HostPort: `${hostPort}` }],
          },
          RestartPolicy: { Name: 'unless-stopped' },
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
        },
      });

      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.ACTIVE },
      });

      await this.activityLogs.create({
        userId,
        projectId,
        action: 'DEPLOYMENT_SUCCESS',
        description: `Deployment succeeded for "${project.name}"`,
      });

      // Generate Nginx config if domain exists
      if (project.domain) {
        await this.nginx.generateConfig(project.domain, hostPort);
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
      });

      this.archive.cleanup(extractDir, file.path);

      throw new BadRequestException(`Deployment failed: ${err.message}`);
    }
  }

  async deployGithub(
    userId: string,
    projectId: string,
    repositoryUrl: string,
    branch = 'main',
  ) {
    const project = await this.verifyProject(projectId, userId);

    const uploadDir = path.resolve(process.cwd(), this.config.get<string>('UPLOAD_DIR', './uploads'));
    const cloneDir = path.join(uploadDir, projectId, `github-${Date.now()}`);

    fs.mkdirSync(path.dirname(cloneDir), { recursive: true });

    await this.activityLogs.create({
      userId,
      projectId,
      action: 'DEPLOYMENT_STARTED',
      description: `Deployment started for "${project.name}" via GitHub`,
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.BUILDING, repositoryUrl },
    });

    try {
      // Clone repository
      this.git.cloneRepository(repositoryUrl, branch, cloneDir);

      const dockerfilePath = path.join(cloneDir, 'Dockerfile');
      const imageName = `portdock-${projectId}`.toLowerCase();
      const imageTag = `v${Date.now()}`;

      if (fs.existsSync(dockerfilePath)) {
        const tarStream = tar.pack(cloneDir);
        await this.docker.buildImage(tarStream, imageName, imageTag);
      } else {
        await this.docker.buildWithNixpacks(cloneDir, imageName, imageTag);
      }

      const hostPort = await this.getAvailablePort();
      const internalPort = await this.docker.getExposedPort(`${imageName}:${imageTag}`);

      const containerName = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
      const dockerContainer = await this.docker.createContainer({
        name: containerName,
        Image: `${imageName}:${imageTag}`,
        ExposedPorts: { [`${internalPort}/tcp`]: {} },
        HostConfig: {
          PortBindings: {
            [`${internalPort}/tcp`]: [{ HostPort: `${hostPort}` }],
          },
          RestartPolicy: { Name: 'unless-stopped' },
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
        },
      });

      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.ACTIVE },
      });

      await this.activityLogs.create({
        userId,
        projectId,
        action: 'DEPLOYMENT_SUCCESS',
        description: `GitHub deployment succeeded for "${project.name}"`,
      });

      // Generate Nginx config if domain exists
      if (project.domain) {
        await this.nginx.generateConfig(project.domain, hostPort);
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
      });

      this.archive.cleanup(cloneDir);

      throw new BadRequestException(`Deployment failed: ${err.message}`);
    }
  }

  private async verifyProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
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
}
