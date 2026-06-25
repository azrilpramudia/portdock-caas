import { Module } from '@nestjs/common';
import { DatabasesController } from './databases.controller';
import { DatabasesService } from './databases.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DockerModule } from '../docker/docker.module';

@Module({
  imports: [PrismaModule, DockerModule],
  controllers: [DatabasesController],
  providers: [DatabasesService],
  exports: [DatabasesService],
})
export class DatabasesModule {}
