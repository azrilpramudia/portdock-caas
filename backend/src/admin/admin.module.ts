import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';

import { SystemService } from './system.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DockerModule } from '../docker/docker.module';
import { ContainersModule } from '../containers/containers.module';
import { DbBackupService } from './db-backup.service';
import { SecurityService } from './security.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DatabasesModule } from '../databases/databases.module';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminUsersService } from './admin-users.service';
import { AdminProjectsService } from './admin-projects.service';
import { AdminContainersService } from './admin-containers.service';
import { AdminActivityService } from './admin-activity.service';
import { AdminDatabasesService } from './admin-databases.service';
import { MetricsGateway } from './metrics.gateway';

@Module({
  imports: [PrismaModule, DockerModule, ContainersModule, DatabasesModule],
  controllers: [AdminController],
  providers: [
    AdminDashboardService,
    AdminUsersService,
    AdminProjectsService,
    AdminContainersService,
    AdminActivityService,
    AdminDatabasesService,
    SystemService,
    DbBackupService,
    SecurityService,
    NotificationsService,
    MetricsGateway,
  ],
})
export class AdminModule {}
