import { Module } from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { DeploymentsController } from './deployments.controller';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { NginxModule } from '../nginx/nginx.module';

@Module({
  imports: [ActivityLogsModule, NginxModule],
  providers: [DeploymentsService],
  controllers: [DeploymentsController],
})
export class DeploymentsModule {}
