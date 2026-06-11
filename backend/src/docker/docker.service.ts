import { Injectable, Logger } from '@nestjs/common';
import Dockerode from 'dockerode';

@Injectable()
export class DockerService {
  private docker: Dockerode;
  private readonly logger = new Logger(DockerService.name);

  constructor() {
    this.docker = new Dockerode({ socketPath: '/var/run/docker.sock' });
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
          this.docker.modem.followProgress(stream!, (err2) => {
            if (err2) reject(err2);
            else resolve();
          });
        },
      );
    });
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
