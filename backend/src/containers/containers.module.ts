import { Module } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { ContainersGateway } from './containers.gateway';
import { ContainersController } from './containers.controller';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { NginxModule } from '../nginx/nginx.module';

@Module({
  imports: [ActivityLogsModule, NginxModule],
  providers: [ContainersService, ContainersGateway],
  controllers: [ContainersController],
  exports: [ContainersService],
})
export class ContainersModule {}
