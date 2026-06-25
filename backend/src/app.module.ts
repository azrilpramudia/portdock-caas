import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { DockerModule } from './docker/docker.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { ContainersModule } from './containers/containers.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { NginxModule } from './nginx/nginx.module';
import { TerminalModule } from './terminal/terminal.module';
import { GitModule } from './git/git.module';
import { ArchiveModule } from './archive/archive.module';
import { BackupModule } from './backup/backup.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    DockerModule,
    AuthModule,
    ProjectsModule,
    ContainersModule,
    DeploymentsModule,
    MonitoringModule,
    ActivityLogsModule,
    NginxModule,
    TerminalModule,
    GitModule,
    ArchiveModule,
    BackupModule,
    WebhooksModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
