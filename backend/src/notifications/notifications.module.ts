import { Module, Global } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [TelegramService, NotificationsService],
  exports: [TelegramService, NotificationsService],
})
export class NotificationsModule {}
