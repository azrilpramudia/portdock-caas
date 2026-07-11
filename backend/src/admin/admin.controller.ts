import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@generated/prisma';
import { ContainersService } from '../containers/containers.service';
import { UpdateResourcesDto } from '../containers/dto/update-resources.dto';
import { SystemService } from './system.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly containersService: ContainersService,
    private readonly systemService: SystemService
  ) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('monitoring')
  async getMonitoringStats(@Query('range') range?: string) {
    const [overview, serverInfo, services, topContainers] = await Promise.all([
      this.systemService.getSystemResources(),
      this.systemService.getServerInfo(),
      this.systemService.getServiceHealth(),
      this.systemService.getTopContainers(),
    ]);

    const historical = await this.systemService.getHistoricalStats(range || '7d');

    // Add uptime to overview to match frontend interface
    const overviewData = {
      ...overview,
      uptime: serverInfo.uptime
    };

    return {
      overview: overviewData,
      serverInfo,
      services,
      topContainers,
      historical
    };
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('projects')
  async getAllProjects(@Query() filters: any) {
    return this.adminService.getAllProjects(filters);
  }

  @Get('deployments')
  async getAllDeployments(@Query() filters: any) {
    return this.adminService.getAllDeployments(filters);
  }

  @Get('containers')
  async getAllContainers(@Query() filters: any) {
    return this.adminService.getAllContainers(filters);
  }

  @Get('activity-logs')
  async getAllActivityLogs(@Query() filters: any) {
    return this.adminService.getAllActivityLogs(filters);
  }

  @Post('containers/:id/start')
  async startContainer(@Param('id') id: string) {
    return this.adminService.startContainer(id);
  }

  @Post('containers/:id/stop')
  async stopContainer(@Param('id') id: string) {
    return this.adminService.stopContainer(id);
  }

  @Post('containers/:id/restart')
  async restartContainer(@Param('id') id: string) {
    return this.adminService.restartContainer(id);
  }

  @Delete('containers/:id')
  async deleteContainer(@Param('id') id: string) {
    return this.adminService.deleteContainer(id);
  }

  @Patch('containers/:id/resources')
  async updateContainerResources(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateResourcesDto,
  ) {
    // Pass isAdmin=true to bypass ownership checks
    return this.containersService.updateResources(id, req.user.id, dto, undefined, true);
  }

  @Patch('projects/:id')
  async updateProject(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProject(id, data);
  }

  @Post('projects/:id/suspend')
  async suspendProject(@Param('id') id: string) {
    return this.adminService.suspendProject(id);
  }

  @Post('projects/:id/resume')
  async resumeProject(@Param('id') id: string) {
    return this.adminService.resumeProject(id);
  }

  @Post('projects/:id/reset-status')
  async resetProjectStatus(@Param('id') id: string) {
    return this.adminService.resetProjectStatus(id);
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string) {
    return this.adminService.deleteProject(id);
  }

  @Post('users')
  async createUser(@Body() data: any) {
    return this.adminService.createUser(data);
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(id, data);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}
