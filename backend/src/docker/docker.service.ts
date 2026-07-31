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
    await this.ensureNetwork();
    await this.ensureSystemContainers();
  }

  private async ensureNetwork() {
    this.logger.log('Ensuring portdock-net network exists...');
    try {
      const networks = await this.docker.listNetworks();
      const networkExists = networks.some((n) => n.Name === 'portdock-net');
      if (!networkExists) {
        this.logger.log('Creating portdock-net network...');
        await this.docker.createNetwork({
          Name: 'portdock-net',
          Driver: 'bridge',
        });
      } else {
        this.logger.log('portdock-net network already exists.');
      }
    } catch (error) {
      this.logger.error(
        `Failed to ensure network: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureSystemContainers() {
    this.logger.log('Ensuring system containers are running...');
    const containers = await this.listContainers(true);
    const nginxContainer = containers.find((c) =>
      c.Names.includes('/portdock-nginx'),
    );

    if (nginxContainer) {
      this.nginxContainerId = nginxContainer.Id;
      if (nginxContainer.State !== 'running') {
        this.logger.log('Starting portdock-nginx container...');
        if (this.nginxContainerId) {
          await this.startContainer(this.nginxContainerId);
        }
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

      const certbotConfDir = path.resolve(process.cwd(), 'certbot-conf');
      const certbotWwwDir = path.resolve(process.cwd(), 'certbot-www');

      if (!fs.existsSync(certbotConfDir))
        fs.mkdirSync(certbotConfDir, { recursive: true });
      if (!fs.existsSync(certbotWwwDir))
        fs.mkdirSync(certbotWwwDir, { recursive: true });

      const container = await this.createContainer({
        name: 'portdock-nginx',
        Image: 'nginx:alpine',
        ExposedPorts: { '80/tcp': {}, '443/tcp': {} },
        HostConfig: {
          PortBindings: {
            '80/tcp': [{ HostPort: '80' }],
            '443/tcp': [{ HostPort: '443' }],
          },
          Binds: [
            `${confDir}:/etc/nginx/conf.d`,
            `${certbotConfDir}:/etc/letsencrypt`,
            `${certbotWwwDir}:/var/www/certbot`,
          ],
          RestartPolicy: { Name: 'always' },
          NetworkMode: 'host', // For easier localhost routing, or bridge mapping
          LogConfig: {
            Type: 'json-file',
            Config: {
              'max-size': '10m',
              'max-file': '3',
            },
          },
        },
      });
      this.nginxContainerId = container.id;
      await container.start();
      this.logger.log('portdock-nginx container started.');
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getSystemNginxContainerId(): Promise<string | null> {
    return this.nginxContainerId;
  }

  getDocker(): Dockerode {
    return this.docker;
  }

  async listContainers(all = true) {
    return this.docker.listContainers({ all });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getContainer(dockerContainerId: string) {
    return this.docker.getContainer(dockerContainerId);
  }

  async inspectContainer(dockerContainerId: string) {
    const container = this.docker.getContainer(dockerContainerId);
    return container.inspect();
  }

  async startContainer(dockerContainerId: string) {
    const container = this.docker.getContainer(dockerContainerId);
    try {
      await container.start();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.statusCode === 304) {
        this.logger.log(`Container ${dockerContainerId} is already running.`);
        return;
      }
      throw error;
    }
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

  async removeImage(imageName: string) {
    try {
      const image = this.docker.getImage(imageName);
      await image.remove({ force: true });
      this.logger.log(`Successfully removed image: ${imageName}`);
    } catch (err) {
      this.logger.warn(
        `Failed to remove image ${imageName}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async createVolume(volumeName: string) {
    try {
      // Check if volume already exists
      const volumeInfo = await this.docker
        .getVolume(volumeName)
        .inspect()
        .catch(() => null);
      if (volumeInfo) return volumeInfo;

      // Create new volume
      const volume = await this.docker.createVolume({
        Name: volumeName,
      });
      return volume;
    } catch (error) {
      this.logger.error(
        `Failed to create volume ${volumeName}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async removeVolume(volumeName: string): Promise<void> {
    try {
      const volume = this.docker.getVolume(volumeName);
      await volume.remove();
    } catch (error) {
      this.logger.error(
        `Failed to remove volume ${volumeName}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getContainerStats(dockerContainerId: string): Promise<any> {
    const container = this.docker.getContainer(dockerContainerId);
    return new Promise((resolve, reject) => {
      container.stats({ stream: false }, (err, data) => {
        if (err) {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
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
        tarStream,
        { t: `${imageName}:${imageTag}` },
        (err, stream) => {
          if (err) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(err);
            return;
          }
          if (!stream) {
            reject(new Error('No stream returned from build'));
            return;
          }
          this.docker.modem.followProgress(
            stream,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (err2, output) => {
              if (err2) {
                this.logger.error('Docker Build Error', err2);
                reject(err2);
              } else {
                resolve();
              }
            },
            (event) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              if (event.stream) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                process.stdout.write(event.stream);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              } else if (event.errorDetail) {
                this.logger.error(
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  `Docker Build Event Error: ${event.errorDetail.message}`,
                );

                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                reject(new Error(event.errorDetail.message));
              }
            },
          );
        },
      );
    });
  }

  async buildWithNixpacks(
    dir: string,
    imageName: string,
    imageTag = 'latest',
    envVars?: Record<string, string>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const tag = `${imageName}:${imageTag}`;
      this.logger.log(`Starting Nixpacks build for ${tag}`);

      const args = ['build', dir, '--name', tag];
      if (envVars) {
        Object.entries(envVars).forEach(([k, v]) => {
          args.push('--env', `${k}=${v}`);
        });
      }

      const child = spawn('nixpacks', args);

      child.stdout.on('data', (data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
        this.logger.error(
          `Failed to start Nixpacks. Is it installed? Error: ${err instanceof Error ? err.message : String(err)}`,
        );
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
      this.logger.warn(
        `Failed to inspect image port: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
    return 3000;
  }

  async pullImage(imageName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.docker.pull(
        imageName,
        (err: Error | null, stream: NodeJS.ReadableStream) => {
          if (err) {
            reject(err);
            return;
          }
          this.docker.modem.followProgress(stream, (err2: Error | null) => {
            if (err2) reject(err2);
            else resolve();
          });
        },
      );
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

  parseStats(stats: {
    cpu_stats: {
      cpu_usage: { total_usage: number };
      system_cpu_usage: number;
      online_cpus?: number;
    };
    precpu_stats: {
      cpu_usage: { total_usage: number };
      system_cpu_usage: number;
    };
    memory_stats: { usage?: number; limit?: number };
    networks?: Record<string, { rx_bytes?: number; tx_bytes?: number }>;
    blkio_stats?: {
      io_service_bytes_recursive?: Array<{ op: string; value: number }>;
    };
  }) {
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
    for (const iface of Object.values(networks)) {
      netRx += iface.rx_bytes || 0;
      netTx += iface.tx_bytes || 0;
    }

    let diskReadMb = 0;
    let diskWriteMb = 0;
    const blkio = stats.blkio_stats?.io_service_bytes_recursive;
    if (Array.isArray(blkio)) {
      for (const io of blkio) {
        if (io.op?.toLowerCase() === 'read') diskReadMb += io.value || 0;
        if (io.op?.toLowerCase() === 'write') diskWriteMb += io.value || 0;
      }
    }

    return {
      cpuPercent: Math.round(cpuPercent * 100) / 100,
      memUsageMb: Math.round(memUsage / 1024 / 1024),
      memLimitMb: Math.round(memLimit / 1024 / 1024),
      memPercent: Math.round(memPercent * 100) / 100,
      netRxMb: Math.round(netRx / 1024 / 1024),
      netTxMb: Math.round(netTx / 1024 / 1024),
      diskReadMb: Math.round((diskReadMb / 1024 / 1024) * 100) / 100,
      diskWriteMb: Math.round((diskWriteMb / 1024 / 1024) * 100) / 100,
    };
  }
}
