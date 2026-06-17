import { Module } from '@nestjs/common';
import { TerminalService } from './terminal.service';
import { TerminalGateway } from './terminal.gateway';
import { DockerModule } from '../docker/docker.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TerminalController } from './terminal.controller';

@Module({
  imports: [DockerModule, PrismaModule],
  controllers: [TerminalController],
  providers: [TerminalService, TerminalGateway],
  exports: [TerminalService],
})
export class TerminalModule {}
