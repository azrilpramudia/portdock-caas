import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import * as util from 'util';
import * as childProcess from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

const execAsync = util.promisify(childProcess.exec);

@Injectable()
export class DbBackupService implements OnModuleInit {
  private readonly logger = new Logger(DbBackupService.name);
  private readonly backupDir: string;
  private readonly jobName = 'dbBackupTask';

  constructor(
    private configService: ConfigService,
    private schedulerRegistry: SchedulerRegistry
  ) {
    this.backupDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  onModuleInit() {
    this.scheduleBackupJob();
  }

  scheduleBackupJob() {
    const schedule = process.env.DB_BACKUP_SCHEDULE || '0 0 * * *'; // Default: every midnight
    
    const job = new CronJob(schedule, () => {
      this.logger.log('Running automated database backup...');
      this.runBackup().catch(e => this.logger.error('Auto backup failed', e));
    });

    try {
      this.schedulerRegistry.addCronJob(this.jobName, job);
      job.start();
      this.logger.log(`Database backup scheduled with cron: ${schedule}`);
    } catch (e) {
      this.logger.error('Failed to schedule backup job', e);
    }
  }

  async reloadSchedule() {
    try {
      this.schedulerRegistry.deleteCronJob(this.jobName);
    } catch (e) {}
    this.scheduleBackupJob();
  }

  async runBackup(): Promise<{ success: boolean; filePath: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `portdock-db-${timestamp}.sql`;
    const filePath = path.join(this.backupDir, fileName);
    
    const dbUser = process.env.DB_USER || 'portdock';
    const dbName = process.env.DB_NAME || 'portdock_db';

    const command = `sudo docker exec portdock_db pg_dump -U ${dbUser} ${dbName} > ${filePath}`;
    
    try {
      await execAsync(command);
      this.logger.log(`Backup successful locally: ${fileName}`);
      
      const provider = process.env.BACKUP_PROVIDER || 'local';
      if (provider === 's3') {
        await this.uploadToS3(filePath, fileName);
      } else if (provider === 'sftp') {
        await this.uploadToSftp(filePath, fileName);
      }
      
      this.cleanupOldBackups();
      
      return { success: true, filePath: fileName };
    } catch (error) {
      this.logger.error('Failed to run backup', error);
      throw new Error('Gagal mengeksekusi backup database internal.');
    }
  }

  private async uploadToS3(filePath: string, fileName: string) {
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const endpoint = process.env.BACKUP_S3_ENDPOINT;
    const region = process.env.BACKUP_S3_REGION || 'us-east-1';
    
    const s3 = new S3Client({
      region,
      endpoint: endpoint ? endpoint : undefined,
      credentials: {
        accessKeyId: process.env.BACKUP_S3_ACCESS_KEY || '',
        secretAccessKey: process.env.BACKUP_S3_SECRET_KEY || ''
      },
      forcePathStyle: true // Needed for many S3-compatible providers
    });

    const fileContent = fs.readFileSync(filePath);
    await s3.send(new PutObjectCommand({
      Bucket: process.env.BACKUP_S3_BUCKET || '',
      Key: fileName,
      Body: fileContent
    }));
    this.logger.log(`Uploaded backup to S3: ${fileName}`);
    fs.unlinkSync(filePath); // Delete locally after upload
  }

  private async uploadToSftp(filePath: string, fileName: string) {
    const Client = require('ssh2-sftp-client');
    const sftp = new Client();
    await sftp.connect({
      host: process.env.BACKUP_SFTP_HOST,
      port: parseInt(process.env.BACKUP_SFTP_PORT || '22'),
      username: process.env.BACKUP_SFTP_USER,
      password: process.env.BACKUP_SFTP_PASS
    });
    
    await sftp.put(filePath, `./${fileName}`);
    await sftp.end();
    this.logger.log(`Uploaded backup to SFTP: ${fileName}`);
    fs.unlinkSync(filePath); // Delete locally after upload
  }

  private cleanupOldBackups() {
    try {
      const provider = process.env.BACKUP_PROVIDER || 'local';
      if (provider !== 'local') return; // Only cleanup local if provider is local
      
      const retention = parseInt(process.env.BACKUP_RETENTION || '7', 10);
      
      const files = fs.readdirSync(this.backupDir)
        .filter(f => f.endsWith('.sql'))
        .map(f => ({ name: f, time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

      if (files.length > retention) {
        const toDelete = files.slice(retention);
        for (const file of toDelete) {
          fs.unlinkSync(path.join(this.backupDir, file.name));
          this.logger.log(`Deleted old backup: ${file.name}`);
        }
      }
    } catch (e) {
      this.logger.error('Failed to cleanup old backups', e);
    }
  }
}
