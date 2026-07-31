import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  Ip,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/auth.interface';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('projects')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per 1 hour
  @ApiOperation({ summary: 'Create a new project' })
  create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateProjectDto,
    @Ip() ip: string,
  ) {
    return this.projectsService.create(req.user.id, dto, ip);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.projectsService.findAll(
      req.user.id,
      search,
      status,
      page,
      limit,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getStats(@Request() req: AuthenticatedRequest) {
    return this.projectsService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Ip() ip: string,
  ) {
    return this.projectsService.update(id, req.user.id, dto, ip);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Ip() ip: string,
  ) {
    return this.projectsService.remove(id, req.user.id, ip);
  }
}
