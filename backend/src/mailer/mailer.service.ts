import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private prisma: PrismaService) {}

  async sendMail(to: string, subject: string, text: string) {
    const adminEmailSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'adminEmail' },
    });

    const fromEmail = adminEmailSetting?.value || 'admin@portdock.local';

    this.logger.log(
      `[MOCK EMAIL] From: ${fromEmail} | To: ${to} | Subject: ${subject}`,
    );
    this.logger.debug(`[MOCK EMAIL CONTENT] ${text}`);

    // TODO: Implement actual SMTP sending logic here (e.g. using nodemailer)
    return true;
  }

  async sendSystemAlert(subject: string, text: string) {
    const adminEmailSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'adminEmail' },
    });

    const adminEmail = adminEmailSetting?.value;
    if (!adminEmail) {
      this.logger.warn('Cannot send system alert: adminEmail not configured.');
      return false;
    }

    return this.sendMail(adminEmail, `[System Alert] ${subject}`, text);
  }
}
