import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Dockerode from 'dockerode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

@Injectable()
export class DockerService implements OnModuleInit {
  private docker: Dockerode;
  private readonly logger = new Logger(DockerService.name);
  private nginxContainerId: string | null = null;

  constructor() {
    this.docker = new Dockerode({ socketPath: '/var/run/docker.sock' });
  }

  async onModuleInit() {
    await this.ensureSystemContainers();
  }

  private async ensureSystemContainers() {
    this.logger.log('Ensuring system containers are running...');
    const containers = await this.listContainers(true);
    const nginxContainer = containers.find((c) => c.Names.includes('/portdock-nginx'));

    if (nginxContainer) {
      this.nginxContainerId = nginxContainer.Id;
      if (nginxContainer.State !== 'running') {
        this.logger.log('Starting portdock-nginx container...');
        await this.startContainer(this.nginxContainerId);
      }
    } else {
      this.logger.log('Creating portdock-nginx container...');
      const confDir = path.resolve(process.cwd(), 'nginx-conf.d');
      if (!fs.existsSync(confDir)) {
        fs.mkdirSync(confDir, { recursive: true });
      }

      const hasImage = await this.imageExists('nginx:alpine');
      if (!hasImage) {
        this.logger.log('Pulling nginx:alpine image...');
        await this.pullImage('nginx:alpine');
      }

      const container = await this.createContainer({
        name: 'portdock-nginx',
        Image: 'nginx:alpine',
        ExposedPorts: { '80/tcp': {} },
        HostConfig: {
          PortBindings: { '80/tcp': [{ HostPort: '80' }] },
          Binds: [`${confDir}:/etc/nginx/conf.d`],
          RestartPolicy: { Name: 'always' },
          NetworkMode: 'host', // For easier localhost routing, or bridge mapping
        },
      });
      this.nginxContainerId = container.id;
      await container.start();
      this.logger.log('portdock-nginx container started.');
    }
  }

  async getSystemNginxContainerId(): Promise<string | null> {
    return this.nginxContainerId;
  }

  getDocker(): Dockerode {
    return this.docker;
  }

  async listContainers(all = true) {
    return this.docker.listContainers({ all });
  }

  async getContainer(dockerContainerId: string) {
    return this.docker.getContainer(dockerContainerId);
  }

  async inspectContainer(dockerContainerId: string) {
    const container = this.docker.getContainer(dockerContainerId);
    return container.inspect();
  }

  async startContainer(dockerContainerId: string) {
    const container = this.docker.getContainer(dockerContainerId);
    await container.start();
  }

  async stopContainer(dockerContainerId: string) {
    const container = this.docker.getContainer(dockerContainerId);
    await container.stop();
  }

  async restartContainer(dockerContainerId: string) {
    const container = this.docker.getContainer(dockerContainerId);
    await container.restart();
  }

  async removeContainer(dockerContainerId: string, force = false) {
    const container = this.docker.getContainer(dockerContainerId);
    await container.remove({ force });
  }

  async getContainerStats(dockerContainerId: string): Promise<any> {
    const container = this.docker.getContainer(dockerContainerId);
    return new Promise((resolve, reject) => {
      container.stats({ stream: false }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async buildImage(
    tarStream: NodeJS.ReadableStream,
    imageName: string,
    imageTag = 'latest',
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.docker.buildImage(
        tarStream as any,
        { t: `${imageName}:${imageTag}` },
        (err, stream) => {
          if (err) {
            reject(err);
            return;
          }
          this.docker.modem.followProgress(
            stream!,
            (err2, output) => {
              if (err2) {
                this.logger.error('Docker Build Error', err2);
                reject(err2);
              } else {
                resolve();
              }
            },
            (event) => {
              if (event.stream) {
                process.stdout.write(event.stream);
              } else if (event.errorDetail) {
                this.logger.error(`Docker Build Event Error: ${event.errorDetail.message}`);
                reject(new Error(event.errorDetail.message));
              }
            }
          );
        },
      );
    });
  }

  async buildWithNixpacks(dir: string, imageName: string, imageTag = 'latest'): Promise<void> {
    return new Promise((resolve, reject) => {
      const tag = `${imageName}:${imageTag}`;
      this.logger.log(`Starting Nixpacks build for ${tag}`);
      const child = spawn('nixpacks', ['build', dir, '--name', tag]);

      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stdout.write(data);
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.logger.log(`Nixpacks build successful for ${tag}`);
          resolve();
        } else {
          reject(new Error(`Nixpacks build failed with exit code ${code}`));
        }
      });
      
      child.on('error', (err) => {
        this.logger.error(`Failed to start Nixpacks. Is it installed? Error: ${err.message}`);
        reject(err);
      });
    });
  }

  async getExposedPort(imageName: string): Promise<number> {
    try {
      const image = await this.docker.getImage(imageName).inspect();
      const exposedPorts = image.Config.ExposedPorts;
      if (exposedPorts) {
        const ports = Object.keys(exposedPorts);
        if (ports.length > 0) {
          return parseInt(ports[0].split('/')[0], 10);
        }
      }
    } catch (e) {
      this.logger.warn(`Failed to inspect image port: ${e.message}`);
    }
    return 3000;
  }

  async pullImage(imageName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.docker.pull(imageName, (err: any, stream: any) => {
        if (err) {
          reject(err);
          return;
        }
        this.docker.modem.followProgress(stream, (err2: any) => {
          if (err2) reject(err2);
          else resolve();
        });
      });
    });
  }

  async createContainer(options: Dockerode.ContainerCreateOptions) {
    return this.docker.createContainer(options);
  }

  async imageExists(imageName: string): Promise<boolean> {
    try {
      const image = this.docker.getImage(imageName);
      await image.inspect();
      return true;
    } catch {
      return false;
    }
  }

  parseStats(stats: any) {
    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta =
      stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const numCpus = stats.cpu_stats.online_cpus || 1;
    const cpuPercent =
      systemDelta > 0 ? (cpuDelta / systemDelta) * numCpus * 100.0 : 0;

    const memUsage = stats.memory_stats.usage || 0;
    const memLimit = stats.memory_stats.limit || 1;
    const memPercent = (memUsage / memLimit) * 100.0;

    const networks = stats.networks || {};
    let netRx = 0;
    let netTx = 0;
    for (const iface of Object.values(networks) as any[]) {
      netRx += iface.rx_bytes || 0;
      netTx += iface.tx_bytes || 0;
    }

    return {
      cpuPercent: Math.round(cpuPercent * 100) / 100,
      memUsageMb: Math.round(memUsage / 1024 / 1024),
      memLimitMb: Math.round(memLimit / 1024 / 1024),
      memPercent: Math.round(memPercent * 100) / 100,
      netRxMb: Math.round(netRx / 1024 / 1024),
      netTxMb: Math.round(netTx / 1024 / 1024),
    };
  }
}
