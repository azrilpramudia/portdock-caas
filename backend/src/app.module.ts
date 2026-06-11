import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { DockerModule } from './docker/docker.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { ContainersModule } from './containers/containers.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { NginxModule } from './nginx/nginx.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
