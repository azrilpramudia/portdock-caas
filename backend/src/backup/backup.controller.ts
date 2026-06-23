import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BackupService } from './backup.service';

@ApiTags('backup')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('run')
  @ApiOperation({ summary: 'Admin: Trigger manual database backup (Force Backup)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Backup has been generated successfully and compressed via GZIP.',
    schema: {
      example: {
        message: 'Backup completed successfully',
        filename: 'backup_2026-06-24T12-00-00.sql.gz',
        path: '/absolute/path/to/backups/backup_2026-06-24T12-00-00.sql.gz'
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Internal server error during backup creation.' })
  async runBackupManual() {
    return this.backupService.runBackup();
  }
}
