import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as si from 'systeminformation';
import * as fs from 'fs';
import Dockerode from 'dockerode';

@Injectable()
export class SystemService {
  private docker: Dockerode;

  constructor(private prisma: PrismaService) {
    this.docker = new Dockerode({ socketPath: '/var/run/docker.sock' });
  }

  async getSystemResources() {
    try {
      const [cpuLoad, mem, disk, networkStats] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
      ]);

      const cpu = Math.round(cpuLoad.currentLoad) || 0;
      const ram = mem.total > 0 ? Math.round((mem.active / mem.total) * 100) : 0;
      const mainDisk = disk[0];
      const diskUsage = mainDisk ? Math.round(mainDisk.use) : 0;
      const net = networkStats[0];
      const network = net ? `${(net.rx_sec / 1024 / 1024).toFixed(1)} MB/s` : '0 MB/s';

      return { cpu, ram, disk: diskUsage, network };
    } catch (e) {
      console.error('Failed to get system resources', e);
      return { cpu: 0, ram: 0, disk: 0, network: '0 MB/s' };
    }
  }

  async getServiceHealth(): Promise<{ name: string; status: 'Active' | 'Warning' | 'Error' | 'Down' }[]> {
    // Check Docker
    let dockerStatus: 'Active' | 'Down' = 'Down';
    try {
      await this.docker.ping();
      dockerStatus = 'Active';
    } catch (e) {
      dockerStatus = 'Down';
    }

    // Check Postgres
    let pgStatus: 'Active' | 'Down' = 'Down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      pgStatus = 'Active';
    } catch (e) {
      pgStatus = 'Down';
    }

    // Check Nginx
    let nginxStatus: 'Active' | 'Warning' | 'Down' = 'Down';
    try {
      const response = await fetch('http://127.0.0.1');
      nginxStatus = response.ok ? 'Active' : 'Warning';
    } catch (e) {
      nginxStatus = 'Down';
    }

    // Check SSL
    const sslStatus = fs.existsSync('/etc/letsencrypt/live') ? 'Active' : 'Warning';

    // WebSocket (App is running, so WS gateway is running)
    const wsStatus = 'Active';

    return [
      { name: "Docker Engine", status: dockerStatus },
      { name: "Nginx", status: nginxStatus as 'Active' | 'Warning' | 'Error' },
      { name: "PostgreSQL", status: pgStatus },
      { name: "SSL (Let's Encrypt)", status: sslStatus },
      { name: "Web Socket", status: wsStatus },
    ];
  }
}
