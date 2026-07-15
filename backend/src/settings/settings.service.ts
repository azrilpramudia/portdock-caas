import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getPublicSettings() {
    const settings = await this.prisma.systemSetting.findMany({
      where: {
        key: {
          in: ['siteName', 'siteDescription', 'language', 'timezone', 'dateFormat', 'timeFormat'],
        },
      },
    });

    const result: Record<string, string> = {
      siteName: 'Portdock',
      siteDescription: 'Platform cloud hosting docker',
      language: 'id',
      timezone: 'Asia/Jakarta',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24-hour',
    };

    settings.forEach((setting) => {
      if (setting.value) {
        result[setting.key] = setting.value;
      }
    });

    return result;
  }
}
