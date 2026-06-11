import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DockerService } from '../docker/docker.service';

@Injectable()
export class NginxService {
  private readonly logger = new Logger(NginxService.name);
  private readonly confDir: string;

  constructor(private dockerService: DockerService) {
    this.confDir = path.resolve(process.cwd(), 'nginx-conf.d');
    if (!fs.existsSync(this.confDir)) {
      fs.mkdirSync(this.confDir, { recursive: true });
    }
  }

  /**
   * Menghasilkan file Nginx server block (.conf)
   */
  async generateConfig(domain: string, hostPort: number): Promise<void> {
    const confContent = `
server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://172.17.0.1:${hostPort};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
`;
    const confPath = path.join(this.confDir, `${domain}.conf`);
    fs.writeFileSync(confPath, confContent);
    this.logger.log(`Nginx config created for ${domain} -> Port ${hostPort}`);
    
    await this.reloadNginx();
  }

  /**
   * Menghapus file .conf jika project dihapus
   */
  async removeConfig(domain: string): Promise<void> {
    const confPath = path.join(this.confDir, `${domain}.conf`);
    if (fs.existsSync(confPath)) {
      fs.unlinkSync(confPath);
      this.logger.log(`Nginx config removed for ${domain}`);
      await this.reloadNginx();
    }
  }

  /**
   * Me-reload container portdock-nginx secara graceful
   */
  async reloadNginx(): Promise<void> {
    try {
      const containerId = await this.dockerService.getSystemNginxContainerId();
      if (!containerId) {
        this.logger.warn('portdock-nginx container not found, skip reload.');
        return;
      }
      const container = await this.dockerService.getContainer(containerId);
      const exec = await container.exec({
        Cmd: ['nginx', '-s', 'reload'],
        AttachStdout: true,
        AttachStderr: true,
      });
      await exec.start({});
      this.logger.log('Nginx reloaded successfully');
    } catch (err) {
      this.logger.error('Failed to reload Nginx', err);
    }
  }
}
