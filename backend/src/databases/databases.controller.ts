import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Put,
  UseGuards,
  Request,
  Ip,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { DatabasesService } from './databases.service';
import { CreateDatabaseDto } from './dto/create-database.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Databases')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('databases')
export class DatabasesController {
  constructor(private readonly databasesService: DatabasesService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per 1 hour
  @ApiOperation({ summary: 'Create a new managed database' })
  create(@Request() req: any, @Body() dto: CreateDatabaseDto, @Ip() ip: string) {
    return this.databasesService.create(req.user.id, dto, ip);
  }

  @Get()
  @ApiOperation({ summary: 'Get all managed databases' })
  findAll(@Request() req: any) {
    return this.databasesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a managed database by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.databasesService.findOne(req.user.id, id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a managed database' })
  start(@Request() req: any, @Param('id') id: string, @Ip() ip: string) {
    return this.databasesService.start(req.user.id, id, ip);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop a managed database' })
  stop(@Request() req: any, @Param('id') id: string, @Ip() ip: string) {
    return this.databasesService.stop(req.user.id, id, ip);
  }

  @Post(':id/restart')
  @ApiOperation({ summary: 'Restart a managed database' })
  restart(@Request() req: any, @Param('id') id: string, @Ip() ip: string) {
    return this.databasesService.restart(req.user.id, id, ip);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Reset database password' })
  resetPassword(@Request() req: any, @Param('id') id: string) {
    return this.databasesService.resetPassword(req.user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a managed database' })
  remove(@Request() req: any, @Param('id') id: string, @Ip() ip: string) {
    return this.databasesService.remove(req.user.id, id, ip);
  }

  // Monitoring and Config Endpoints

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get real-time database stats' })
  getStats(@Request() req: any, @Param('id') id: string) {
    return this.databasesService.getStats(req.user.id, id);
  }



  // Backup Endpoints

  @Get(':id/backups')
  @ApiOperation({ summary: 'List backups for a database' })
  listBackups(@Request() req: any, @Param('id') id: string) {
    return this.databasesService.listBackups(req.user.id, id);
  }

  @Post(':id/backups')
  @ApiOperation({ summary: 'Create a backup for a database' })
  createBackup(@Request() req: any, @Param('id') id: string, @Ip() ip: string) {
    return this.databasesService.createBackup(req.user.id, id, ip);
  }

  @Delete(':id/backups/:backupId')
  @ApiOperation({ summary: 'Delete a database backup' })
  deleteBackup(@Request() req: any, @Param('id') id: string, @Param('backupId') backupId: string) {
    return this.databasesService.deleteBackup(req.user.id, id, backupId);
  }

  @Post(':id/backups/:backupId/restore')
  @ApiOperation({ summary: 'Restore a database backup' })
  restoreBackup(@Request() req: any, @Param('id') id: string, @Param('backupId') backupId: string, @Ip() ip: string) {
    return this.databasesService.restoreBackup(req.user.id, id, backupId, ip);
  }

  @Get(':id/backups/:backupId/download')
  @ApiOperation({ summary: 'Download a database backup' })
  async downloadBackup(@Request() req: any, @Param('id') id: string, @Param('backupId') backupId: string, @Res({ passthrough: true }) res: any) {
    const fileStream = await this.databasesService.getBackupStream(req.user.id, id, backupId);
    const backup = await this.databasesService.getBackupRecord(backupId);
    res.set({
      'Content-Type': 'application/sql',
      'Content-Disposition': `attachment; filename="${backup.filename}"`,
    });
    return new StreamableFile(fileStream);
  }
}
