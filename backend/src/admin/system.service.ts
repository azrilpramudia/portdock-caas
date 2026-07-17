import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as si from 'systeminformation';
import * as fs from 'fs';
import Dockerode from 'dockerode';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DbBackupService } from './db-backup.service';

const execAsync = promisify(exec);

@Injectable()
export class SystemService implements OnModuleInit {
  private docker: Dockerode;

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private dbBackup: DbBackupService
  ) {
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
      const network = net ? `${(net.tx_sec / 1024 / 1024).toFixed(1)} MB/s` : '0 MB/s';

      const diskPartitions = disk.map(d => ({
        path: d.mount,
        size: `${(d.size / 1073741824).toFixed(0)} GB`,
        percent: Math.round(d.use)
      }));

      return { cpu, ram, disk: diskUsage, network, diskPartitions };
    } catch (e) {
      console.error('Failed to get system resources', e);
      return { cpu: 0, ram: 0, disk: 0, network: '0 MB/s', diskPartitions: [] };
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

    // Check Firewall
    let firewallStatus: 'Active' | 'Warning' | 'Down' = 'Down';
    try {
      const { execSync } = require('child_process');
      const ufw = execSync('systemctl is-active ufw', { stdio: 'pipe' }).toString().trim();
      firewallStatus = ufw === 'active' ? 'Active' : 'Warning';
    } catch (e) {
      firewallStatus = 'Warning';
    }

    return [
      { name: "Docker Engine", status: dockerStatus },
      { name: "Nginx", status: nginxStatus as 'Active' | 'Warning' | 'Error' },
      { name: "PostgreSQL", status: pgStatus },
      { name: "SSL (Let's Encrypt)", status: sslStatus },
      { name: "Web Socket", status: wsStatus },
      { name: "Firewall (UFW)", status: firewallStatus },
    ];
  }

  async getServerInfo() {
    try {
      const [osInfo, netInterfaces, dockerInfo, cpuLoad] = await Promise.all([
        si.osInfo(),
        si.networkInterfaces(),
        this.docker.version().catch(() => ({ Version: 'Unknown' })),
        si.currentLoad(),
      ]);

      const time = si.time();
      const uptimeDays = Math.floor(time.uptime / 86400);
      const uptimeHours = Math.floor((time.uptime % 86400) / 3600);
      const uptimeStr = `${uptimeDays} Days, ${uptimeHours} Hours`;
      
      const lastRebootDate = new Date(Date.now() - (time.uptime * 1000));
      const lastReboot = lastRebootDate.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

      let ip = 'Unknown';
      if (Array.isArray(netInterfaces)) {
        const primaryInterface = netInterfaces.find(n => !n.internal && n.ip4);
        if (primaryInterface) ip = primaryInterface.ip4;
      }
      
      let dockerCompose = 'Unknown';
      try {
        const { execSync } = require('child_process');
        dockerCompose = execSync('docker compose version --short').toString().trim();
      } catch (e) {
        // Ignore
      }

      const tzSetting = await this.prisma.systemSetting.findUnique({
        where: { key: 'timezone' }
      });
      const timezoneSetting = tzSetting?.value;

      return {
        name: osInfo.hostname,
        ip,
        provider: process.env.SERVER_PROVIDER || 'Self-Hosted',
        os: `${osInfo.distro} ${osInfo.release}`,
        kernel: osInfo.kernel,
        architecture: osInfo.arch,
        dockerVersion: dockerInfo.Version,
        dockerCompose,
        uptime: uptimeStr,
        timezone: timezoneSetting || time.timezone || 'Unknown',
        lastReboot,
        currentLoad: `${cpuLoad.avgLoad?.toFixed(2) || '0.00'} (1m)`,
      };
    } catch (e) {
      console.error('Failed to get server info', e);
      return {
        name: 'Unknown', ip: 'Unknown', provider: 'Unknown', os: 'Unknown', dockerVersion: 'Unknown', uptime: 'Unknown', kernel: 'Unknown', architecture: 'Unknown', dockerCompose: 'Unknown', timezone: 'Unknown', lastReboot: 'Unknown', currentLoad: 'Unknown'
      };
    }
  }

  async getTopContainers() {
    try {
      const containers = await this.docker.listContainers({ all: false });
      const statsPromises = containers.map(async (c) => {
        try {
          const stats = await this.docker.getContainer(c.Id).stats({ stream: false });
          // calculate CPU%
          let cpuPercent = 0;
          const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
          const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
          if (cpuDelta > 0 && systemDelta > 0) {
            cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;
          }
          
          // calculate RAM%
          const memUsage = stats.memory_stats.usage || 0;
          const memLimit = stats.memory_stats.limit || 1;
          const memPercent = (memUsage / memLimit) * 100;

          const name = c.Names[0]?.replace('/', '') || 'Unknown';
          const project = c.Labels['com.docker.compose.project'] || c.Image || 'Standalone';
          const isCaas = !!c.Labels['portdock.caas'];

          return {
            id: c.Id,
            name: isCaas ? name.replace('portdock-', '') : name,
            cpu: Math.round(cpuPercent * 10) / 10,
            ram: Math.round(memPercent * 10) / 10,
            project: isCaas ? 'App' : project,
          };
        } catch {
          return null;
        }
      });

      const containerStats = (await Promise.all(statsPromises)).filter(Boolean);
      // Sort by CPU + RAM combined score or just CPU
      containerStats.sort((a, b) => (b!.cpu + b!.ram) - (a!.cpu + a!.ram));
      return containerStats.slice(0, 5);
    } catch (e) {
      console.error('Failed to get top containers', e);
      return [];
    }
  }

  async onModuleInit() {
    const count = await this.prisma.systemMetric.count();
    if (count === 0) {
      console.log('Seeding initial SystemMetric data...');
      const data: any[] = [];
      const today = new Date();
      // Seed 7 days back, 1 point every 2 hours -> 84 points.
      for (let i = 84; i >= 1; i--) {
        const date = new Date(today);
        date.setHours(date.getHours() - (i * 2));
        data.push({
          cpu: Math.floor(Math.random() * (85 - 30 + 1) + 30),
          ram: Math.floor(Math.random() * (12 - 6 + 1) + 6),
          disk: 45,
          networkOut: 1.5,
          createdAt: date
        });
      }
      await this.prisma.systemMetric.createMany({ data });
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    const resources = await this.getSystemResources();
    const diskVal = typeof resources.disk === 'number' ? resources.disk : 0;
    const networkVal = parseFloat(resources.network.replace(' MB/s', '')) || 0;
    
    await this.prisma.systemMetric.create({
      data: {
        cpu: resources.cpu,
        ram: resources.ram,
        disk: diskVal,
        networkOut: networkVal,
      }
    });

    if (resources.cpu >= 90) {
      this.eventEmitter.emit('system.alert', {
        title: 'High CPU Usage Detected',
        message: `System CPU load is currently at ${resources.cpu}%. Please check running containers.`,
      });
    }
    
    if (resources.ram >= 90) {
      this.eventEmitter.emit('system.alert', {
        title: 'High Memory Usage Detected',
        message: `System Memory usage is currently at ${resources.ram}%. Please check running containers.`,
      });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldMetrics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await this.prisma.systemMetric.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    console.log(`Cleaned up ${result.count} system metrics older than 30 days`);
  }

  async getHistoricalStats(range: string = '7d') {
    let days = 7;
    if (range === '24h') days = 1;
    if (range === '30d') days = 30;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const metrics = await this.prisma.systemMetric.findMany({
      where: {
        createdAt: {
          gte: fromDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const aggregated: any[] = [];
    
    for (const metric of metrics) {
      let label = '';
      if (range === '24h') {
        label = metric.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      } else {
        label = metric.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      }

      aggregated.push({
        name: label,
        cpu: metric.cpu,
        ram: metric.ram,
        disk: metric.disk
      });
    }

    return aggregated;
  }

  async executeAction(action: string): Promise<{ success: boolean; message: string }> {
    try {
      switch (action) {
        case 'restart-server':
          setTimeout(() => {
            execAsync('sudo reboot').catch(e => {
              console.error('Server restart failed:', e);
            });
          }, 1000);
          return { success: true, message: 'Server sedang di-restart. Anda akan kehilangan koneksi sementara dalam beberapa detik.' };
        
        case 'restart-docker':
          await execAsync('sudo systemctl restart docker').catch(e => {
            console.error('Docker restart failed:', e);
            throw new Error('Gagal me-restart Docker. Membutuhkan akses sudo tanpa password.');
          });
          return { success: true, message: 'Docker service berhasil di-restart.' };
        
        case 'restart-nginx':
          try {
            const container = this.docker.getContainer('portdock-nginx');
            await container.restart();
          } catch (e) {
            await execAsync('docker restart portdock-nginx').catch(() => {
              throw new Error('Container portdock-nginx tidak ditemukan atau gagal di-restart.');
            });
          }
          return { success: true, message: 'Nginx berhasil di-restart.' };
        
        case 'prune-docker':
          await execAsync('sudo docker system prune -a --volumes -f');
          return { success: true, message: 'Docker system prune berhasil dijalankan (volumes, images, & containers dibersihkan).' };
          
        case 'clear-cache':
          await execAsync('docker system prune -f');
          return { success: true, message: 'Sistem cache (Docker build cache & unused data) berhasil dibersihkan.' };
        
        case 'run-backup':
          await new Promise(resolve => setTimeout(resolve, 3000));
          return { success: true, message: 'Backup berhasil dijalankan (Simulasi).' };
          
        default:
          throw new Error('Aksi tidak dikenali.');
      }
    } catch (error: any) {
      console.error(`Failed to execute action ${action}:`, error);
      throw new Error(`Gagal mengeksekusi aksi: ${error.message}`);
    }
  }

  async getDockerDaemonConfig(): Promise<any> {
    try {
      const fs = require('fs');
      if (fs.existsSync('/etc/docker/daemon.json')) {
        const data = fs.readFileSync('/etc/docker/daemon.json', 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (e) {
      console.error('Failed to read daemon.json:', e);
      return {};
    }
  }

  async updateDockerDaemonConfig(config: any): Promise<void> {
    try {
      const configStr = JSON.stringify(config, null, 2);
      await execAsync(`echo '${configStr}' | sudo tee /etc/docker/daemon.json`);
      
      // Delay restart by 2 seconds so the API can return a success response first.
      setTimeout(() => {
        execAsync('sudo systemctl restart docker').catch(e => {
          console.error('Delayed Docker restart failed:', e);
        });
      }, 2000);
    } catch (e) {
      console.error('Failed to update daemon.json:', e);
      throw new Error('Gagal memperbarui konfigurasi Docker. Pastikan sistem memiliki akses sudo.');
    }
  }

  async getSystemLogs(): Promise<string> {
    try {
      try {
        const { stdout } = await execAsync('journalctl -n 200 --no-pager');
        return stdout;
      } catch {
        const { stdout } = await execAsync('tail -n 200 /var/log/syslog 2>/dev/null || tail -n 200 /var/log/messages');
        return stdout;
      }
    } catch (e) {
      return 'Gagal mengambil system logs. Pastikan Anda memiliki izin akses yang cukup (root/sudo) atau file log tersedia.';
    }
  }

  async getNginxConfig(): Promise<any> {
    const fs = require('fs');
    const path = require('path');
    const confDir = path.resolve(process.cwd(), 'nginx-conf.d');
    
    let clientMaxBodySize = '';
    let proxyReadTimeout = '';
    let templateHttp = '';

    const globalConfPath = path.join(confDir, '00-global.conf');
    if (fs.existsSync(globalConfPath)) {
      const globalContent = fs.readFileSync(globalConfPath, 'utf8');
      const bodyMatch = globalContent.match(/client_max_body_size\s+([^;]+);/);
      if (bodyMatch) clientMaxBodySize = bodyMatch[1];
      
      const timeoutMatch = globalContent.match(/proxy_read_timeout\s+([^;]+);/);
      if (timeoutMatch) proxyReadTimeout = timeoutMatch[1];
    }

    const templatePath = path.join(confDir, 'template-http.conf');
    if (fs.existsSync(templatePath)) {
      templateHttp = fs.readFileSync(templatePath, 'utf8');
    }

    let templateHttps = '';
    const templateHttpsPath = path.join(confDir, 'template-https.conf');
    if (fs.existsSync(templateHttpsPath)) {
      templateHttps = fs.readFileSync(templateHttpsPath, 'utf8');
    }

    return { clientMaxBodySize, proxyReadTimeout, templateHttp, templateHttps };
  }

  async updateNginxConfig(config: any): Promise<void> {
    const fs = require('fs');
    const path = require('path');
    const confDir = path.resolve(process.cwd(), 'nginx-conf.d');

    if (!fs.existsSync(confDir)) {
      fs.mkdirSync(confDir, { recursive: true });
    }

    const { clientMaxBodySize, proxyReadTimeout, templateHttp, templateHttps } = config;

    let globalContent = '';
    if (clientMaxBodySize) {
      globalContent += `client_max_body_size ${clientMaxBodySize};\n`;
    }
    if (proxyReadTimeout) {
      globalContent += `proxy_read_timeout ${proxyReadTimeout};\n`;
      globalContent += `proxy_connect_timeout ${proxyReadTimeout};\n`;
      globalContent += `proxy_send_timeout ${proxyReadTimeout};\n`;
    }

    const globalConfPath = path.join(confDir, '00-global.conf');
    if (globalContent) {
      fs.writeFileSync(globalConfPath, globalContent);
    } else if (fs.existsSync(globalConfPath)) {
      fs.unlinkSync(globalConfPath);
    }

    const templatePath = path.join(confDir, 'template-http.conf');
    if (templateHttp) {
      fs.writeFileSync(templatePath, templateHttp);
    } else if (fs.existsSync(templatePath)) {
      fs.unlinkSync(templatePath);
    }

    const templateHttpsPath = path.join(confDir, 'template-https.conf');
    if (templateHttps) {
      fs.writeFileSync(templateHttpsPath, templateHttps);
    } else if (fs.existsSync(templateHttpsPath)) {
      fs.unlinkSync(templateHttpsPath);
    }

    // Delay restart by 2 seconds so API returns success first
    setTimeout(() => {
      execAsync('docker restart portdock-nginx').catch(e => {
        console.error('Delayed Nginx restart failed:', e);
      });
    }, 2000);
  }

  getDbConfig() {
    return {
      maxConnections: process.env.DB_MAX_CONNECTIONS || '100',
      memLimit: process.env.DB_MEM_LIMIT || '512M',
      backupSchedule: process.env.DB_BACKUP_SCHEDULE || '0 0 * * *'
    };
  }

  async updateDbConfig(config: any): Promise<void> {
    const { maxConnections, memLimit, backupSchedule } = config;
    const envPath = require('path').resolve(process.cwd(), '.env');
    
    if (require('fs').existsSync(envPath)) {
      let envContent = require('fs').readFileSync(envPath, 'utf8');
      
      const updateEnv = (key: string, value: string) => {
        if (envContent.includes(`${key}=`)) {
          envContent = envContent.replace(new RegExp(`^${key}=.*`, 'm'), `${key}="${value}"`);
        } else {
          envContent += `\n${key}="${value}"`;
        }
        process.env[key] = value;
      };

      if (maxConnections) updateEnv('DB_MAX_CONNECTIONS', maxConnections);
      if (memLimit) updateEnv('DB_MEM_LIMIT', memLimit);
      if (backupSchedule) {
        updateEnv('DB_BACKUP_SCHEDULE', backupSchedule);
        this.dbBackup.reloadSchedule();
      }

      require('fs').writeFileSync(envPath, envContent);

      // restart DB container in background if maxConnections or memLimit changed
      if (maxConnections || memLimit) {
        setTimeout(() => {
          execAsync('docker compose up -d db').catch(e => console.error('Delayed DB restart failed:', e));
        }, 2000);
      }
    }
  }

  async runDbBackup() {
    return this.dbBackup.runBackup();
  }

  getSslConfig() {
    return {
      acmeEmail: process.env.ACME_EMAIL || '',
      acmeServer: process.env.ACME_SERVER || '',
      forceHttps: process.env.FORCE_HTTPS || 'true'
    };
  }

  async updateSslConfig(config: any): Promise<void> {
    const { acmeEmail, acmeServer, forceHttps } = config;
    const envPath = require('path').resolve(process.cwd(), '.env');
    
    if (require('fs').existsSync(envPath)) {
      let envContent = require('fs').readFileSync(envPath, 'utf8');
      
      const updateEnv = (key: string, value: string) => {
        if (envContent.includes(`${key}=`)) {
          envContent = envContent.replace(new RegExp(`^${key}=.*`, 'm'), `${key}="${value}"`);
        } else {
          envContent += `\n${key}="${value}"`;
        }
        process.env[key] = value;
      };

      if (acmeEmail !== undefined) updateEnv('ACME_EMAIL', acmeEmail);
      if (acmeServer !== undefined) updateEnv('ACME_SERVER', acmeServer);
      if (forceHttps !== undefined) updateEnv('FORCE_HTTPS', forceHttps);

      require('fs').writeFileSync(envPath, envContent);
    }
  }

  getBackupConfig() {
    return {
      backupProvider: process.env.BACKUP_PROVIDER || 'local',
      backupSchedule: process.env.DB_BACKUP_SCHEDULE || '0 0 * * *',
      backupRetention: process.env.BACKUP_RETENTION || '7',
      s3Endpoint: process.env.BACKUP_S3_ENDPOINT || '',
      s3Region: process.env.BACKUP_S3_REGION || '',
      s3Bucket: process.env.BACKUP_S3_BUCKET || '',
      s3AccessKey: process.env.BACKUP_S3_ACCESS_KEY || '',
      s3SecretKey: process.env.BACKUP_S3_SECRET_KEY || '',
      sftpHost: process.env.BACKUP_SFTP_HOST || '',
      sftpPort: process.env.BACKUP_SFTP_PORT || '22',
      sftpUser: process.env.BACKUP_SFTP_USER || '',
      sftpPass: process.env.BACKUP_SFTP_PASS || ''
    };
  }

  async updateBackupConfig(config: any): Promise<void> {
    const envPath = require('path').resolve(process.cwd(), '.env');
    
    if (require('fs').existsSync(envPath)) {
      let envContent = require('fs').readFileSync(envPath, 'utf8');
      
      const updateEnv = (key: string, value: string) => {
        if (value === undefined) return;
        if (envContent.includes(`${key}=`)) {
          envContent = envContent.replace(new RegExp(`^${key}=.*`, 'm'), `${key}="${value}"`);
        } else {
          envContent += `\n${key}="${value}"`;
        }
        process.env[key] = value;
      };

      updateEnv('BACKUP_PROVIDER', config.backupProvider);
      updateEnv('DB_BACKUP_SCHEDULE', config.backupSchedule);
      updateEnv('BACKUP_RETENTION', config.backupRetention);
      updateEnv('BACKUP_S3_ENDPOINT', config.s3Endpoint);
      updateEnv('BACKUP_S3_REGION', config.s3Region);
      updateEnv('BACKUP_S3_BUCKET', config.s3Bucket);
      updateEnv('BACKUP_S3_ACCESS_KEY', config.s3AccessKey);
      updateEnv('BACKUP_S3_SECRET_KEY', config.s3SecretKey);
      updateEnv('BACKUP_SFTP_HOST', config.sftpHost);
      updateEnv('BACKUP_SFTP_PORT', config.sftpPort);
      updateEnv('BACKUP_SFTP_USER', config.sftpUser);
      updateEnv('BACKUP_SFTP_PASS', config.sftpPass);

      require('fs').writeFileSync(envPath, envContent);

      if (config.backupSchedule) {
        this.dbBackup.reloadSchedule();
      }
    }
  }

  // ==============================
  // Advanced Features
  // ==============================
  async getGlobalEnvVars() {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'globalEnvVars' },
    });
    
    if (!setting) return [];
    
    try {
      const parsed = JSON.parse(setting.value);
      return Object.entries(parsed).map(([key, value]) => ({ key, value }));
    } catch {
      return [];
    }
  }

  async updateGlobalEnvVars(vars: Array<{ key: string; value: string }>) {
    const envObj: Record<string, string> = {};
    for (const v of vars) {
      if (v.key) {
        envObj[v.key] = v.value || '';
      }
    }
    
    await this.prisma.systemSetting.upsert({
      where: { key: 'globalEnvVars' },
      update: { value: JSON.stringify(envObj) },
      create: { key: 'globalEnvVars', value: JSON.stringify(envObj), category: 'advanced' },
    });
  }

  async factoryReset() {
    try {
      // 1. Ambil semua data container & db dari Prisma
      const appContainers = await this.prisma.container.findMany();
      const managedDbs = await this.prisma.managedDatabase.findMany();
      
      const dockerIds = [
        ...appContainers.map(c => c.dockerContainerId),
        ...managedDbs.map(d => d.dockerContainerId)
      ].filter(Boolean) as string[];

      // 2. Hapus dari Docker daemon
      for (const id of dockerIds) {
        try {
          const container = this.docker.getContainer(id);
          await container.stop().catch(() => {});
          await container.remove({ force: true }).catch(() => {});
        } catch (e) {
          // ignore
        }
      }

      // 3. Hapus data user dan log dari Database (Hapus Projects juga otomatis menghapus Containers via Cascade)
      // Jangan hapus User dgn Role ADMIN
      await this.prisma.project.deleteMany({});
      await this.prisma.managedDatabase.deleteMany({});
      await this.prisma.activityLog.deleteMany({});
      await this.prisma.terminalLog.deleteMany({});
      await this.prisma.deployment.deleteMany({});
      
      // Hapus non-admin users
      await this.prisma.user.deleteMany({
        where: { role: { not: 'ADMIN' } }
      });
      
      return { success: true };
    } catch (error: any) {
      throw new Error(`Factory reset failed: ${error.message}`);
    }
  }
}
