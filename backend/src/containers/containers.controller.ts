import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Ip,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContainersService } from './containers.service';
import { CreateContainerDto } from './dto/create-container.dto';


@ApiTags('containers')
@ApiCookieAuth()
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
    @Ip() ip: string,
  ) {
    return this.containersService.create(req.user.id, projectId, dto, ip);
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
  start(@Request() req: any, @Param('id') id: string, @Ip() ip: string) {
    return this.containersService.start(id, req.user.id, ip);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop a container' })
  stop(@Request() req: any, @Param('id') id: string, @Ip() ip: string) {
    return this.containersService.stop(id, req.user.id, ip);
  }

  @Post(':id/restart')
  @ApiOperation({ summary: 'Restart a container' })
  restart(@Request() req: any, @Param('id') id: string, @Ip() ip: string) {
    return this.containersService.restart(id, req.user.id, ip);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a container' })
  remove(@Request() req: any, @Param('id') id: string, @Ip() ip: string) {
    return this.containersService.remove(id, req.user.id, ip);
  }



  @Patch(':id/internal-port')
  @ApiOperation({ summary: 'Update container internal port' })
  updateInternalPort(
    @Request() req: any,
    @Param('id') id: string,
    @Body('port') port: number,
    @Ip() ip: string,
  ) {
    return this.containersService.updateResources(
      id,
      req.user.id,
      { internalPort: port },
      ip,
      false,
    );
  }

  @Post(':id/allocate-port')
  @ApiOperation({ summary: 'Allocate a specific host port' })
  allocatePort(
    @Request() req: any,
    @Param('id') id: string,
    @Body('port') port: number,
    @Ip() ip: string,
  ) {
    return this.containersService.allocatePort(id, req.user.id, port, ip);
  }

  @Delete(':id/allocate-port')
  @ApiOperation({ summary: 'Remove the allocated host port' })
  removePort(@Request() req: any, @Param('id') id: string, @Ip() ip: string) {
    return this.containersService.removePort(id, req.user.id, ip);
  }
}
