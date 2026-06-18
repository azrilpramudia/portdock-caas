import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MonitoringService } from './monitoring.service';

@ApiTags('monitoring')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitoring')
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getDashboard(@Request() req: any) {
    return this.monitoringService.getDashboardStats(req.user.id);
  }

  @Get(':containerId/stats')
  @ApiOperation({ summary: 'Get container resource stats' })
  getStats(@Request() req: any, @Param('containerId') containerId: string) {
    return this.monitoringService.getContainerStats(containerId, req.user.id);
  }
}
