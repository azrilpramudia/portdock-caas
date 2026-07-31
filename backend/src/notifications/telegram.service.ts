import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private prisma: PrismaService) {}

  async sendMessage(
    message: string,
    overrideConfig?: { token: string; chatId: string },
  ) {
    let token = overrideConfig?.token;
    let chatId = overrideConfig?.chatId;

    if (!token || !chatId) {
      // Get settings from DB
      const settings = await this.prisma.systemSetting.findMany({
        where: {
          key: { in: ['telegramBotToken', 'telegramChatId', 'notifyTelegram'] },
        },
      });

      const notifyTelegram =
        settings.find((s) => s.key === 'notifyTelegram')?.value === 'true';
      if (!notifyTelegram) {
        this.logger.debug(
          'Telegram notifications are disabled globally. Skipping message.',
        );
        return {
          success: false,
          message: 'Telegram notifications are disabled',
        };
      }

      const tokenSetting = settings.find((s) => s.key === 'telegramBotToken');
      const chatIdSetting = settings.find((s) => s.key === 'telegramChatId');

      token = tokenSetting?.value;
      chatId = chatIdSetting?.value;
    }

    if (!token || !chatId) {
      this.logger.debug(
        'Telegram Bot Token or Chat ID is not configured. Skipping message.',
      );
      return {
        success: false,
        message: 'Telegram Bot Token or Chat ID is not configured',
      };
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();

      if (!response.ok) {
        this.logger.error(`Telegram API error: ${JSON.stringify(data)}`);
        return {
          success: false,

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: data.description || 'Unknown Telegram API Error',
        };
      }

      this.logger.log(`Successfully sent Telegram message to ${chatId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send Telegram message: ${error}`);
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
