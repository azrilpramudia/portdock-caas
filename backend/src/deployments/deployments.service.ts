import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import extractZip from 'extract-zip';
import * as tar from 'tar-fs';
import { PrismaService } from '../prisma/prisma.service';
import { DockerService } from '../docker/docker.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ProjectStatus } from '@prisma/client';
import { execSync } from 'child_process';
import { ConfigService } from '@nestjs/config';

import { NginxService } from '../nginx/nginx.service';

@Injectable()
export class DeploymentsService {
  private readonly logger = new Logger(DeploymentsService.name);

  constructor(
    private prisma: PrismaService,
    private docker: DockerService,
    private activityLogs: ActivityLogsService,
    private config: ConfigService,
    private nginx: NginxService,
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
      // Extract ZIP
      await extractZip(file.path, { dir: extractDir });

      // Flatten directory if ZIP contains a single root folder
      this.flattenDirectory(extractDir);

      // Check for Dockerfile
      const dockerfilePath = path.join(extractDir, 'Dockerfile');
      if (!fs.existsSync(dockerfilePath)) {
        // Generate a simple Dockerfile if not present
        const detectedRuntime = this.detectRuntime(extractDir);
        fs.writeFileSync(dockerfilePath, this.generateDockerfile(detectedRuntime));
      }

      const imageName = `portdock-${projectId}`.toLowerCase();
      const imageTag = `v${Date.now()}`;

      // Create tar stream for Docker build
      const tarStream = tar.pack(extractDir);
      await this.docker.buildImage(tarStream, imageName, imageTag);

      // Find available port
      const hostPort = await this.getAvailablePort();
      const internalPort = this.detectPort(extractDir);

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
      fs.rmSync(extractDir, { recursive: true, force: true });
      fs.unlinkSync(file.path);

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

      try {
        fs.rmSync(extractDir, { recursive: true, force: true });
        fs.unlinkSync(file.path);
      } catch {}

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
      execSync(`git clone --depth 1 --branch ${branch} ${repositoryUrl} ${cloneDir}`, {
        timeout: 120000,
        stdio: 'pipe',
      });

      const dockerfilePath = path.join(cloneDir, 'Dockerfile');
      if (!fs.existsSync(dockerfilePath)) {
        const detectedRuntime = this.detectRuntime(cloneDir);
        fs.writeFileSync(dockerfilePath, this.generateDockerfile(detectedRuntime));
      }

      const imageName = `portdock-${projectId}`.toLowerCase();
      const imageTag = `v${Date.now()}`;
      const tarStream = tar.pack(cloneDir);
      await this.docker.buildImage(tarStream, imageName, imageTag);

      const hostPort = await this.getAvailablePort();
      const internalPort = this.detectPort(cloneDir);

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

      fs.rmSync(cloneDir, { recursive: true, force: true });

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

      try {
        fs.rmSync(cloneDir, { recursive: true, force: true });
      } catch {}

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

  private flattenDirectory(dir: string) {
    const items = fs.readdirSync(dir);
    if (items.length === 1) {
      const singleItemPath = path.join(dir, items[0]);
      if (fs.statSync(singleItemPath).isDirectory()) {
        const innerItems = fs.readdirSync(singleItemPath);
        for (const item of innerItems) {
          fs.renameSync(path.join(singleItemPath, item), path.join(dir, item));
        }
        fs.rmSync(singleItemPath, { recursive: true, force: true });
      }
    }
  }

  private detectRuntime(dir: string): string {
    if (fs.existsSync(path.join(dir, 'package.json'))) return 'node';
    if (fs.existsSync(path.join(dir, 'requirements.txt'))) return 'python';
    if (fs.existsSync(path.join(dir, 'go.mod'))) return 'go';
    if (fs.existsSync(path.join(dir, 'pom.xml'))) return 'java';
    if (fs.existsSync(path.join(dir, 'index.html'))) return 'static';
    return 'node';
  }

  private detectPort(dir: string): number {
    try {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'),
      );
      if (pkg.scripts?.start?.includes('3000')) return 3000;
    } catch {}
    if (fs.existsSync(path.join(dir, 'index.html'))) return 80;
    return 3000;
  }

  private generateDockerfile(runtime: string): string {
    switch (runtime) {
      case 'python':
        return `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]`;
      case 'go':
        return `FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o main .
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
CMD ["./main"]`;
      case 'static':
        return `FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY . .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;
      default:
        return `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]`;
    }
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
