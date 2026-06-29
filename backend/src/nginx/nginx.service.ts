import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DockerService } from '../docker/docker.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NginxService {
  private readonly logger = new Logger(NginxService.name);
  private readonly confDir: string;

  constructor(
    private dockerService: DockerService,
    private configService: ConfigService,
  ) {
    this.confDir = path.resolve(process.cwd(), 'nginx-conf.d');
    if (!fs.existsSync(this.confDir)) {
      fs.mkdirSync(this.confDir, { recursive: true });
    }
  }

  /**
   * Menghasilkan HTTP file Nginx (port 80) yang mendukung Let's Encrypt webroot
   */
  async generateHttpConfig(domain: string, hostPort: number): Promise<void> {
    const confContent = `
server {
    listen 80;
    server_name ${domain};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

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
    this.logger.log(
      `HTTP Nginx config created for ${domain} -> Port ${hostPort}`,
    );

    await this.reloadNginx();
  }

  /**
   * Meminta sertifikat SSL dari Let's Encrypt
   */
  async requestSsl(domain: string, email: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'development') {
      this.logger.log(
        `Skipping SSL request for ${domain} in development mode.`,
      );
      return false; // Skip SSL generation locally
    }

    this.logger.log(`Requesting SSL for ${domain} with email ${email}...`);
    try {
      const certbotConfDir = path.resolve(process.cwd(), 'certbot-conf');
      const certbotWwwDir = path.resolve(process.cwd(), 'certbot-www');

      // Check for Wildcard SSL Certificate first
      const baseDomain = this.configService.get<string>('BASE_DOMAIN');
      if (baseDomain && domain.endsWith(`.${baseDomain}`)) {
        const wildcardPath = path.join(
          certbotConfDir,
          'live',
          baseDomain,
          'fullchain.pem',
        );
        if (fs.existsSync(wildcardPath)) {
          this.logger.log(
            `Wildcard certificate for ${baseDomain} found. Using it for ${domain}.`,
          );
          return true;
        }
      }

      // Check if certificate already exists
      const certPath = path.join(
        certbotConfDir,
        'live',
        domain,
        'fullchain.pem',
      );
      if (fs.existsSync(certPath)) {
        this.logger.log(`Certificate for ${domain} already exists.`);
        return true;
      }

      // Pastikan image certbot ada
      const hasImage = await this.dockerService.imageExists(
        'certbot/certbot:latest',
      );
      if (!hasImage) {
        this.logger.log('Pulling certbot/certbot:latest image...');
        await this.dockerService.pullImage('certbot/certbot:latest');
      }

      const container = await this.dockerService.getDocker().createContainer({
        Image: 'certbot/certbot:latest',
        Cmd: [
          'certonly',
          '--webroot',
          '-w',
          '/var/www/certbot',
          '-d',
          domain,
          '--email',
          email,
          '--agree-tos',
          '--non-interactive',
        ],
        HostConfig: {
          Binds: [
            `${certbotConfDir}:/etc/letsencrypt`,
            `${certbotWwwDir}:/var/www/certbot`,
          ],
        },
      });

      await container.start();
      const stream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
      });
      stream.on('data', (chunk) =>
        this.logger.debug(`Certbot: ${chunk.toString('utf8')}`),
      );

      const result = await container.wait();

      try {
        await container.remove();
      } catch (e) {}

      if (result.StatusCode === 0) {
        this.logger.log(`SSL certificate successfully generated for ${domain}`);
        return true;
      } else {
        this.logger.warn(`Certbot failed with status ${result.StatusCode}`);
        return false;
      }
    } catch (err) {
      this.logger.error(`Failed to request SSL for ${domain}`, err);
      return false;
    }
  }

  /**
   * Menghasilkan HTTPS file Nginx (port 443 + redirect) setelah SSL berhasil
   */
  async generateHttpsConfig(domain: string, hostPort: number): Promise<void> {
    const baseDomain = this.configService.get<string>('BASE_DOMAIN');
    let certPath = `/etc/letsencrypt/live/${domain}/fullchain.pem`;
    let keyPath = `/etc/letsencrypt/live/${domain}/privkey.pem`;

    if (baseDomain && domain.endsWith(`.${baseDomain}`)) {
      const certbotConfDir = path.resolve(process.cwd(), 'certbot-conf');
      const wildcardPath = path.join(
        certbotConfDir,
        'live',
        baseDomain,
        'fullchain.pem',
      );
      if (fs.existsSync(wildcardPath)) {
        certPath = `/etc/letsencrypt/live/${baseDomain}/fullchain.pem`;
        keyPath = `/etc/letsencrypt/live/${baseDomain}/privkey.pem`;
      }
    }

    const confContent = `
server {
    listen 80;
    server_name ${domain};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${domain};

    ssl_certificate ${certPath};
    ssl_certificate_key ${keyPath};

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
    this.logger.log(
      `HTTPS Nginx config created for ${domain} -> Port ${hostPort}`,
    );

    await this.reloadNginx();
  }

  /**
   * Fungsi wrapper untuk backwards compatibility.
   * Ini dulu dipanggil langsung, sekarang hanya nama alias.
   */
  async generateConfig(domain: string, hostPort: number): Promise<void> {
    await this.generateHttpConfig(domain, hostPort);
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
