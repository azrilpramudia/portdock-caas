import { Module } from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { DeploymentsController } from './deployments.controller';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { NginxModule } from '../nginx/nginx.module';
import { ArchiveModule } from '../archive/archive.module';
import { GitModule } from '../git/git.module';

@Module({
  imports: [ActivityLogsModule, NginxModule, ArchiveModule, GitModule],
  providers: [DeploymentsService],
  controllers: [DeploymentsController],
})
export class DeploymentsModule {}
