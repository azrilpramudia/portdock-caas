import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get public system settings' })
  @ApiResponse({ status: 200, description: 'Return public settings.' })
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }
}
