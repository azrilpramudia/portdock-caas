import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DockerService } from '../docker/docker.service';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { exec } from 'child_process';

@Injectable()
export class NginxService {
  private readonly logger = new Logger(NginxService.name);
  private readonly confDir: string;

  private readonly pathsDir: string;

  constructor(
    private dockerService: DockerService,
    private configService: ConfigService,
  ) {
    const customConfDir = this.configService.get<string>('NGINX_CONF_DIR');
    let targetConfDir = customConfDir || '/etc/nginx/portdock-apps';

    try {
      if (!fs.existsSync(targetConfDir)) {
        fs.mkdirSync(targetConfDir, { recursive: true });
      }
      const testFile = path.join(targetConfDir, '.test_write');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (err: any) {
      targetConfDir = path.resolve(process.cwd(), 'nginx-conf');
      if (!fs.existsSync(targetConfDir)) {
        fs.mkdirSync(targetConfDir, { recursive: true });
      }
      this.logger.warn(
        `Cannot write to /etc/nginx/portdock-apps, falling back to local directory: ${targetConfDir}`,
      );
    }

    this.confDir = targetConfDir;
    this.pathsDir = path.resolve(this.confDir, 'paths');
    if (!fs.existsSync(this.pathsDir)) {
      fs.mkdirSync(this.pathsDir, { recursive: true });
    }
    const maintenanceDir = path.resolve(this.confDir, 'maintenance');
    if (!fs.existsSync(maintenanceDir)) {
      fs.mkdirSync(maintenanceDir, { recursive: true });
    }
    const maintenanceFile = path.join(maintenanceDir, 'status.conf');
    if (!fs.existsSync(maintenanceFile)) {
      fs.writeFileSync(maintenanceFile, '');
    }

    // Create base domain config
    const baseDomain = this.configService.get<string>('BASE_DOMAIN');
    if (baseDomain) {
      const baseConfPath = path.join(this.confDir, '00-base-domain.conf');
      const certPaths = this.getCertPaths(baseDomain);

      let baseConfContent = `
server {
    listen 80;
    server_name ${baseDomain};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
`;

      if (certPaths) {
        baseConfContent += `
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${baseDomain};

    ssl_certificate ${certPaths.certPath};
    ssl_certificate_key ${certPaths.keyPath};

    include /etc/nginx/portdock-apps/paths/*.conf;
}
`;
      } else {
        baseConfContent += `
    include /etc/nginx/portdock-apps/paths/*.conf;
}
`;
      }

      fs.writeFileSync(baseConfPath, baseConfContent);

      // Create db.{baseDomain} → Adminer config
      const dbDomain = `db.${baseDomain}`;
      const dbConfPath = path.join(this.confDir, '01-db-adminer.conf');
      const dbCertPaths = this.getCertPaths(dbDomain) || this.getCertPaths(baseDomain);

      let dbConfContent = `
server {
    listen 80;
    server_name ${dbDomain};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
`;

      if (dbCertPaths) {
        dbConfContent += `
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${dbDomain};

    ssl_certificate ${dbCertPaths.certPath};
    ssl_certificate_key ${dbCertPaths.keyPath};

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
`;
      } else {
        dbConfContent += `
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
`;
      }

      fs.writeFileSync(dbConfPath, dbConfContent);
      this.logger.log(`Adminer Nginx config created for ${dbDomain} -> localhost:8080`);

      // Add db.{baseDomain} to /etc/hosts if local
      void this.addToHostsFile(dbDomain);
    }
  }

  private getCertPaths(domain: string): { certPath: string; keyPath: string } | null {
    const certbotConfDir = path.resolve(process.cwd(), 'certbot-conf');
    const localCert = path.join(certbotConfDir, 'live', domain, 'fullchain.pem');
    const localKey = path.join(certbotConfDir, 'live', domain, 'privkey.pem');
    const systemCert = `/etc/letsencrypt/live/${domain}/fullchain.pem`;
    const systemKey = `/etc/letsencrypt/live/${domain}/privkey.pem`;

    if (fs.existsSync(systemCert) && fs.existsSync(systemKey)) {
      return { certPath: systemCert, keyPath: systemKey };
    }
    if (fs.existsSync(localCert) && fs.existsSync(localKey)) {
      return { certPath: localCert, keyPath: localKey };
    }

    const baseDomain = this.configService.get<string>('BASE_DOMAIN');
    if (baseDomain && domain.endsWith(`.${baseDomain}`)) {
      const sysWild1 = `/etc/letsencrypt/live/${baseDomain}/fullchain.pem`;
      const sysWildKey1 = `/etc/letsencrypt/live/${baseDomain}/privkey.pem`;
      if (fs.existsSync(sysWild1) && fs.existsSync(sysWildKey1)) {
        return { certPath: sysWild1, keyPath: sysWildKey1 };
      }
      const sysWild2 = `/etc/letsencrypt/live/${baseDomain}-0001/fullchain.pem`;
      const sysWildKey2 = `/etc/letsencrypt/live/${baseDomain}-0001/privkey.pem`;
      if (fs.existsSync(sysWild2) && fs.existsSync(sysWildKey2)) {
        return { certPath: sysWild2, keyPath: sysWildKey2 };
      }
      const locWild = path.join(certbotConfDir, 'live', baseDomain, 'fullchain.pem');
      const locWildKey = path.join(certbotConfDir, 'live', baseDomain, 'privkey.pem');
      if (fs.existsSync(locWild) && fs.existsSync(locWildKey)) {
        return { certPath: locWild, keyPath: locWildKey };
      }
    }

    return null;
  }

  private async addToHostsFile(domain: string): Promise<void> {
    if (domain === 'localhost' || domain === '127.0.0.1') return;

    return new Promise((resolve) => {
      try {
        const hostsContent = fs.readFileSync('/etc/hosts', 'utf8');
        if (hostsContent.includes(domain)) {
          this.logger.log(`Domain ${domain} already exists in /etc/hosts`);
          return resolve();
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {}

      const scriptPath = path.resolve(process.cwd(), 'scripts', 'add-host.sh');
      const command = `sudo -n ${scriptPath} ${domain}`;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.logger.warn(`Could not automatically add ${domain} to /etc/hosts (requires passwordless sudo): ${error.message}`);
        } else {
          this.logger.log(`Added ${domain} to /etc/hosts successfully`);
        }
        resolve();
      });
    });
  }

  /**
   * Menghasilkan HTTP file Nginx (port 80) yang mendukung Let's Encrypt webroot
   */
  async generateHttpConfig(
    domain: string,
    hostPort: number,
    projectName?: string,
  ): Promise<void> {
    const templatePath = path.join(this.confDir, 'template-http.conf');
    let confContent = '';

    if (fs.existsSync(templatePath)) {
      const template = fs.readFileSync(templatePath, 'utf8');
      confContent = template
        .replace(/{{domain}}/g, domain)
        .replace(/{{hostPort}}/g, hostPort.toString())
        .replace(/{{projectName}}/g, projectName || '');
    } else {
      confContent = `
server {
    listen 80;
    server_name ${domain};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        include /etc/nginx/portdock-apps/maintenance/status.conf;
        proxy_pass http://127.0.0.1:${hostPort};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
`;
    }
    const confPath = path.join(this.confDir, `${domain}.conf`);
    fs.writeFileSync(confPath, confContent);
    this.logger.log(
      `HTTP Nginx config created for ${domain} -> Port ${hostPort}`,
    );

    // Create path-based routing config
    const baseDomain = this.configService.get<string>('BASE_DOMAIN');
    if (baseDomain && projectName) {
      const pathConfContent = `
location /${projectName}/ {
    include /etc/nginx/portdock-apps/maintenance/status.conf;
    proxy_pass http://127.0.0.1:${hostPort}/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
`;
      const pathConfPath = path.join(this.pathsDir, `${projectName}.conf`);
      fs.writeFileSync(pathConfPath, pathConfContent);
      this.logger.log(
        `Path-based config created for /${projectName}/ -> Port ${hostPort}`,
      );
    } else {
      // Only add to hosts file if it's a custom domain, not path based
      await this.addToHostsFile(domain);
    }

    await this.reloadNginx();
  }

  async requestSsl(domain: string, email: string): Promise<boolean> {
    this.logger.log(`Requesting SSL for ${domain} with email ${email}...`);
    try {
      const certbotConfDir = path.resolve(process.cwd(), 'certbot-conf');
      const certbotWwwDir = path.resolve(process.cwd(), 'certbot-www');

      // Check for Wildcard SSL Certificate first
      const baseDomain = this.configService.get<string>('BASE_DOMAIN');
      if (baseDomain && domain.endsWith(`.${baseDomain}`)) {
        const wildcardPath1 = `/etc/letsencrypt/live/${baseDomain}/fullchain.pem`;
        const wildcardPath2 = `/etc/letsencrypt/live/${baseDomain}-0001/fullchain.pem`;
        if (fs.existsSync(wildcardPath1) || fs.existsSync(wildcardPath2)) {
          this.logger.log(`Using existing wildcard SSL for ${domain}`);
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

      if (process.env.NODE_ENV === 'development') {
        this.logger.log(
          `Generating mkcert SSL for ${domain} in development mode...`,
        );
        const domainCertDir = path.join(certbotConfDir, 'live', domain);
        if (!fs.existsSync(domainCertDir)) {
          fs.mkdirSync(domainCertDir, { recursive: true });
        }

        return new Promise((resolve) => {
          const mkcertCmd = `mkcert -cert-file "${path.join(domainCertDir, 'fullchain.pem')}" -key-file "${path.join(domainCertDir, 'privkey.pem')}" "${domain}"`;
          exec(mkcertCmd, (error) => {
            if (error) {
              this.logger.error(
                `Failed to generate mkcert for ${domain}`,
                error,
              );
              resolve(false);
            } else {
              this.logger.log(`Successfully generated mkcert for ${domain}`);
              resolve(true);
            }
          });
        });
      }

      // Pastikan image certbot ada
      const hasImage = await this.dockerService.imageExists(
        'certbot/certbot:latest',
      );
      if (!hasImage) {
        this.logger.log('Pulling certbot/certbot:latest image...');
        await this.dockerService.pullImage('certbot/certbot:latest');
      }

      const acmeEmail = process.env.ACME_EMAIL || email;
      const acmeServer = process.env.ACME_SERVER;

      const certbotCmd = [
        'certonly',
        '--webroot',
        '-w',
        '/var/www/certbot',
        '-d',
        domain,
        '--email',
        acmeEmail,
        '--agree-tos',
        '--non-interactive',
      ];

      if (acmeServer) {
        certbotCmd.push('--server', acmeServer);
      }

      const container = await this.dockerService.getDocker().createContainer({
        Image: 'certbot/certbot:latest',
        Cmd: certbotCmd,
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.logger.debug(`Certbot: ${chunk.toString('utf8')}`),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await container.wait();

      try {
        await container.remove();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {}

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result.StatusCode === 0) {
        this.logger.log(`SSL certificate successfully generated for ${domain}`);
        return true;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
  async generateHttpsConfig(
    domain: string,
    hostPort: number,
    projectName?: string,
  ): Promise<void> {
    const certPaths = this.getCertPaths(domain);
    if (!certPaths) {
      this.logger.warn(
        `No valid SSL certificates found for ${domain}. HTTPS config skipped.`,
      );
      return;
    }

    const { certPath, keyPath } = certPaths;
    const templatePath = path.join(this.confDir, 'template-https.conf');
    let confContent = '';

    if (fs.existsSync(templatePath)) {
      const template = fs.readFileSync(templatePath, 'utf8');
      confContent = template
        .replace(/{{domain}}/g, domain)
        .replace(/{{hostPort}}/g, hostPort.toString())
        .replace(/{{projectName}}/g, projectName || '')
        .replace(/{{certPath}}/g, certPath)
        .replace(/{{keyPath}}/g, keyPath);
    } else {
      const forceHttps = process.env.FORCE_HTTPS !== 'false';
      const httpRedirectOrProxy = forceHttps
        ? `        return 301 https://$host$request_uri;`
        : `        include /etc/nginx/portdock-apps/maintenance/status.conf;
        proxy_pass http://127.0.0.1:${hostPort};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";`;

      confContent = `
server {
    listen 80;
    server_name ${domain};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
${httpRedirectOrProxy}
    }
}

server {
    listen 443 ssl;
    server_name ${domain};

    ssl_certificate ${certPath};
    ssl_certificate_key ${keyPath};

    location / {
        include /etc/nginx/portdock-apps/maintenance/status.conf;
        proxy_pass http://127.0.0.1:${hostPort};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
`;
    }
    const confPath = path.join(this.confDir, `${domain}.conf`);
    fs.writeFileSync(confPath, confContent);
    this.logger.log(
      `HTTPS Nginx config created for ${domain} -> Port ${hostPort}`,
    );

    // Also update base domain to support HTTPS if it has a wildcard or base cert
    const baseDomain = this.configService.get<string>('BASE_DOMAIN');
    if (baseDomain) {
      const baseCertPaths = this.getCertPaths(baseDomain);
      if (baseCertPaths) {
        const baseConfPath = path.join(this.confDir, '00-base-domain.conf');
        const baseConfContent = `
server {
    listen 80;
    server_name ${baseDomain};
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${baseDomain};

    ssl_certificate ${baseCertPaths.certPath};
    ssl_certificate_key ${baseCertPaths.keyPath};

    include /etc/nginx/portdock-apps/paths/*.conf;
}
`;
        fs.writeFileSync(baseConfPath, baseConfContent);
      }
    }

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
  async removeConfig(domain: string, projectName?: string): Promise<void> {
    const confPath = path.join(this.confDir, `${domain}.conf`);
    if (fs.existsSync(confPath)) {
      fs.unlinkSync(confPath);
      this.logger.log(`Removed Nginx config for ${domain}`);
    }

    if (projectName) {
      const pathConfPath = path.join(this.pathsDir, `${projectName}.conf`);
      if (fs.existsSync(pathConfPath)) {
        fs.unlinkSync(pathConfPath);
        this.logger.log(`Removed path config for /${projectName}/`);
      }
    }

    // Menghapus domain dari /etc/hosts secara otomatis tanpa password (Passwordless Sudo)
    if (domain) {
      const scriptPath = path.resolve(
        process.cwd(),
        'scripts',
        'remove-host.sh',
      );
      const command = `sudo -n ${scriptPath} ${domain}`;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.logger.warn(
            `Could not automatically remove ${domain} from /etc/hosts (requires passwordless sudo): ${error.message}`,
          );
        } else {
          this.logger.log(`Successfully removed ${domain} from /etc/hosts`);
        }
      });
    }

    await this.reloadNginx();
  }

  /**
   * Me-reload Nginx secara graceful
   */
  async reloadNginx(): Promise<void> {
    try {
      const { execSync } = require('child_process');
      const isRoot = typeof process.getuid === 'function' && process.getuid() === 0;
      const reloadCmd = isRoot ? 'systemctl reload nginx' : 'sudo -n systemctl reload nginx';
      const startCmd = isRoot ? 'systemctl start nginx' : 'sudo -n systemctl start nginx';

      try {
        execSync(reloadCmd, { stdio: 'pipe' });
        this.logger.log('Host Nginx reloaded successfully');
      } catch (reloadErr: any) {
        // If inactive or failed, attempt to start
        try {
          execSync(startCmd, { stdio: 'pipe' });
          this.logger.log('Host Nginx was not active, started successfully');
        } catch (startErr: any) {
          // Fallback to docker container if present
          try {
            execSync('docker exec portdock-nginx nginx -s reload', { stdio: 'pipe' });
            this.logger.log('Docker portdock-nginx reloaded successfully');
          } catch {
            throw reloadErr;
          }
        }
      }
    } catch (err: any) {
      this.logger.warn(`Host Nginx reload skipped or failed (dev mode): ${err.message}`);
    }
  }

  @OnEvent('system.maintenance.toggled')
  async handleMaintenanceToggle(payload: { enabled: boolean }) {
    const maintenanceFile = path.join(
      this.confDir,
      'maintenance',
      'status.conf',
    );
    if (payload.enabled) {
      const content = `
        default_type text/html;
        return 503 "<!DOCTYPE html><html><head><title>Maintenance</title><style>body{font-family:sans-serif;text-align:center;padding:50px;background:#f5f5f5;color:#333}h1{font-size:2em;margin-bottom:10px}p{font-size:1.2em;color:#666}</style></head><body><h1>🛠️ System Maintenance</h1><p>Our platform is currently undergoing scheduled maintenance.<br>We will be back shortly. Thank you for your patience!</p></body></html>";
      `;
      fs.writeFileSync(maintenanceFile, content);
    } else {
      fs.writeFileSync(maintenanceFile, '');
    }

    // Attempt to inject include into any existing configs that miss it
    try {
      const files = fs
        .readdirSync(this.confDir)
        .filter((f) => f.endsWith('.conf') && f !== '00-base-domain.conf');
      for (const file of files) {
        const p = path.join(this.confDir, file);
        let content = fs.readFileSync(p, 'utf8');
        if (
          !content.includes(
            'include /etc/nginx/portdock-apps/maintenance/status.conf;',
          )
        ) {
          content = content.replace(
            /location \/ \{/g,
            'location / {\n        include /etc/nginx/portdock-apps/maintenance/status.conf;',
          );
          fs.writeFileSync(p, content);
        }
      }
    } catch (e) {
      this.logger.error('Failed to update existing configs for maintenance', e);
    }

    this.logger.log(
      `Maintenance mode ${payload.enabled ? 'enabled' : 'disabled'}`,
    );
    await this.reloadNginx();
  }
}
