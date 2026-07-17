import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SystemService } from './system.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DockerModule } from '../docker/docker.module';
import { ContainersModule } from '../containers/containers.module';
import { DbBackupService } from './db-backup.service';
import { SecurityService } from './security.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [PrismaModule, DockerModule, ContainersModule],
  controllers: [AdminController],
  providers: [AdminService, SystemService, DbBackupService, SecurityService, NotificationsService],
})
export class AdminModule {}
