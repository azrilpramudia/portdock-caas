import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'notifyWebhook',
            'webhookUrl',
            'notifyEmail',
            'smtpHost',
            'smtpPort',
            'smtpUser',
            'smtpPass',
            'smtpFrom',
          ],
        },
      },
    });

    const getConfig = (k: string) =>
      settings.find((s) => s.key === k)?.value || '';

    return {
      webhook: {
        enabled: getConfig('notifyWebhook') === 'true',
        url: getConfig('webhookUrl'),
      },
      email: {
        enabled: getConfig('notifyEmail') === 'true',
        host: getConfig('smtpHost'),
        port: parseInt(getConfig('smtpPort') || '587', 10),
        user: getConfig('smtpUser'),
        pass: getConfig('smtpPass'),
        from: getConfig('smtpFrom'),
      },
    };
  }

  async updateSettings(data: Record<string, any>) {
    const updates: { key: string; value: string }[] = [];

    // Webhook
    if (data.webhook !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.webhook.enabled !== undefined) {
        updates.push({
          key: 'notifyWebhook',

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value: data.webhook.enabled.toString(),
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.webhook.url !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updates.push({ key: 'webhookUrl', value: data.webhook.url });
      }
    }

    // Email
    if (data.email !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.email.enabled !== undefined) {
        updates.push({
          key: 'notifyEmail',

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value: data.email.enabled.toString(),
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.email.host !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updates.push({ key: 'smtpHost', value: data.email.host });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.email.port !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updates.push({ key: 'smtpPort', value: data.email.port.toString() });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.email.user !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updates.push({ key: 'smtpUser', value: data.email.user });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.email.pass !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updates.push({ key: 'smtpPass', value: data.email.pass });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.email.from !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updates.push({ key: 'smtpFrom', value: data.email.from });
      }
    }

    for (const update of updates) {
      await this.prisma.systemSetting.upsert({
        where: { key: update.key },
        update: { value: update.value },
        create: {
          key: update.key,
          value: update.value,
          category: 'notifications',
        },
      });
    }
  }

  async testWebhook(url: string) {
    if (!url) throw new Error('Webhook URL is required');
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content:
            '👋 **Test Notification from Portdock CAAS**\nThis is a test message to verify your webhook configuration.',
          text: '👋 Test Notification from Portdock CAAS\nThis is a test message to verify your webhook configuration.',
        }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status} ${response.statusText}`,
        );
      }
      return { success: true };
    } catch (e: any) {
      this.logger.error('Failed to send webhook test', e);
      throw new Error(
        `Failed to send webhook: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  async testEmail(emailConfig: any, toEmail: string) {
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      !emailConfig.host ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      !emailConfig.user ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      !emailConfig.pass ||
      !toEmail
    ) {
      throw new Error('Incomplete SMTP configuration or missing recipient');
    }

    try {
      const transporter = nodemailer.createTransport({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        host: emailConfig.host,

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        port: parseInt(emailConfig.port || '587', 10),

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        secure: emailConfig.port === 465 || emailConfig.port === '465',
        auth: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          user: emailConfig.user,

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          pass: emailConfig.pass,
        },
      });

      await transporter.sendMail({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        from: emailConfig.from || '"Portdock CAAS" <noreply@portdock.local>',
        to: toEmail,
        subject: 'Portdock CAAS - Test Notification',
        text: 'Hello!\n\nThis is a test message from Portdock CAAS to verify your SMTP configuration.',
        html: '<p>Hello!</p><p>This is a test message from <b>Portdock CAAS</b> to verify your SMTP configuration.</p>',
      });

      return { success: true };
    } catch (e: any) {
      this.logger.error('Failed to send test email', e);
      throw new Error(
        `Failed to send email: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  // Generic broadcast method to be used by system monitoring
  async broadcastAlert(title: string, message: string) {
    const settings = await this.getSettings();

    // 1. Webhook
    if (settings.webhook.enabled && settings.webhook.url) {
      try {
        await fetch(settings.webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **${title}**\n${message}`,
            text: `🚨 ${title}\n${message}`,
          }),
        });
      } catch (e) {
        this.logger.error('Failed to broadcast webhook', e);
      }
    }

    // 2. Email (send to SMTP User or admin email)
    if (settings.email.enabled && settings.email.host && settings.email.user) {
      try {
        const transporter = nodemailer.createTransport({
          host: settings.email.host,
          port: settings.email.port,
          secure: settings.email.port === 465,
          auth: {
            user: settings.email.user,
            pass: settings.email.pass,
          },
        });

        // We will send to the first admin user in the system
        const adminUser = await this.prisma.user.findFirst({
          where: { role: 'ADMIN' },
        });
        if (adminUser) {
          await transporter.sendMail({
            from:
              settings.email.from ||
              '"Portdock CAAS Alert" <noreply@portdock.local>',
            to: adminUser.email,
            subject: `[Portdock Alert] ${title}`,
            text: `${message}`,
            html: `<p><b>${title}</b></p><p>${message.replace(/\n/g, '<br/>')}</p>`,
          });
        }
      } catch (e) {
        this.logger.error('Failed to broadcast email', e);
      }
    }
  }
}
