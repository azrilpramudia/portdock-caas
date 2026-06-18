import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiProduces,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityLogsService } from './activity-logs.service';

@ApiTags('activity-logs')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private activityLogsService: ActivityLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get activity logs' })
  findAll(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.activityLogsService.findAll(
      req.user.id,
      page,
      limit,
      search,
      action,
      startDate,
      endDate,
      status,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export activity logs to CSV' })
  @ApiProduces('text/csv')
  async export(
    @Request() req: any,
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const csv = await this.activityLogsService.exportLogs(
      req.user.id,
      search,
      action,
      startDate,
      endDate,
      status,
    );
    res.header('Content-Type', 'text/csv');
    res.attachment('activity-logs.csv');
    return res.send(csv);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent activity logs' })
  findRecent(@Request() req: any) {
    return this.activityLogsService.findRecent(req.user.id, 10);
  }
}
