import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir: string;
  private readonly RETENTION_DAYS = 7;

  constructor(private configService: ConfigService) {
    this.backupDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Runs every day at 02:00 AM
  @Cron('0 2 * * *')
  async handleDailyBackup() {
    this.logger.log('Starting scheduled daily backup...');
    try {
      await this.runBackup();
    } catch (error) {
      this.logger.error(
        `Scheduled backup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async runBackup() {
    try {
      const dbUrl = this.configService.get<string>('DATABASE_URL');
      if (!dbUrl) {
        throw new Error('DATABASE_URL is not defined in environment variables');
      }

      // Parse the DB URL to extract credentials
      const parsedUrl = new URL(dbUrl);
      const username = parsedUrl.username;
      const password = parsedUrl.password;
      const host = parsedUrl.hostname;
      const port = parsedUrl.port || '5432';
      const dbName = parsedUrl.pathname.substring(1);

      // Generate filename with current date and time
      const date = new Date();
      const timestamp = date.toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${timestamp}.sql.gz`;
      const filePath = path.join(this.backupDir, filename);

      this.logger.log(`Generating backup: ${filename}...`);

      // Construct Docker command to run pg_dump and pipe to gzip
      // Using postgres:15 alpine image because it's small and contains pg_dump
      const dockerCmd = `docker run --rm --network host -e PGPASSWORD="${password}" postgres:15-alpine pg_dump -h ${host} -p ${port} -U ${username} -d ${dbName} | gzip > ${filePath}`;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { stdout, stderr } = await execAsync(dockerCmd);

      if (stderr) {
        // Warning: pg_dump sometimes writes non-errors to stderr, but we log it just in case
        this.logger.debug(`pg_dump stderr: ${stderr}`);
      }

      this.logger.log(`Backup completed successfully: ${filePath}`);

      // Run cleanup policy
      await this.enforceRetentionPolicy();

      return {
        message: 'Backup completed successfully',
        filename,
        path: filePath,
      };
    } catch (error) {
      this.logger.error('Database backup failed', error);
      throw new InternalServerErrorException(
        `Backup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async enforceRetentionPolicy() {
    try {
      const files = fs
        .readdirSync(this.backupDir)
        .filter((file) => file.endsWith('.sql.gz'))
        .map((file) => ({
          name: file,
          path: path.join(this.backupDir, file),
          time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time); // Descending (newest first)

      if (files.length > this.RETENTION_DAYS) {
        this.logger.log(
          `Retention policy: Found ${files.length} backups. Deleting backups older than ${this.RETENTION_DAYS} files...`,
        );

        // Delete all files beyond the RETENTION_DAYS threshold
        const filesToDelete = files.slice(this.RETENTION_DAYS);
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path);
          this.logger.log(`Deleted old backup: ${file.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to enforce retention policy', error);
    }
  }
}
