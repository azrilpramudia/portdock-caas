import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { DatabasesService } from './databases.service';
import { CreateDatabaseDto } from './dto/create-database.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Databases')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('databases')
export class DatabasesController {
  constructor(private readonly databasesService: DatabasesService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per 1 hour
  @ApiOperation({ summary: 'Create a new managed database' })
  create(@Request() req: any, @Body() dto: CreateDatabaseDto) {
    return this.databasesService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all managed databases' })
  findAll(@Request() req: any) {
    return this.databasesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a managed database by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.databasesService.findOne(req.user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a managed database' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.databasesService.remove(req.user.id, id);
  }
}
