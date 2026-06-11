import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContainersService } from './containers.service';
import { CreateContainerDto } from './dto/create-container.dto';

@ApiTags('containers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('containers')
export class ContainersController {
  constructor(private containersService: ContainersService) {}

  @Post('project/:projectId')
  @ApiOperation({ summary: 'Create a container for a project' })
  create(
    @Request() req: any,
    @Param('projectId') projectId: string,
    @Body() dto: CreateContainerDto,
  ) {
    return this.containersService.create(req.user.id, projectId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all containers' })
  findAll(@Request() req: any, @Query('projectId') projectId?: string) {
    return this.containersService.findAll(req.user.id, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get container detail' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.containersService.findOne(id, req.user.id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a container' })
  start(@Request() req: any, @Param('id') id: string) {
    return this.containersService.start(id, req.user.id);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop a container' })
  stop(@Request() req: any, @Param('id') id: string) {
    return this.containersService.stop(id, req.user.id);
  }

  @Post(':id/restart')
  @ApiOperation({ summary: 'Restart a container' })
  restart(@Request() req: any, @Param('id') id: string) {
    return this.containersService.restart(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a container' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.containersService.remove(id, req.user.id);
  }
}
