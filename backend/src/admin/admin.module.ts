import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SystemService } from './system.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DockerModule } from '../docker/docker.module';
@Module({
  imports: [PrismaModule, DockerModule],
  controllers: [AdminController],
  providers: [AdminService, SystemService],
})
export class AdminModule {}
