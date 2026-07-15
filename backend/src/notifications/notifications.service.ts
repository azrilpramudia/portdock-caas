import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TelegramService } from './telegram.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private telegramService: TelegramService,
    private prisma: PrismaService,
  ) {}

  private async isNotificationEnabled(key: string): Promise<boolean> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    if (!setting) {
      // Match frontend defaults
      return ['notifyDeployments', 'notifySystem', 'notifySecurity'].includes(key);
    }
    return setting.value === 'true';
  }

  @OnEvent('security.alert')
  async handleSecurityAlert(payload: { title: string; message: string; ip?: string }) {
    const isEnabled = await this.isNotificationEnabled('notifySecurity');
    if (!isEnabled) return;

    const text = `🚨 <b>SECURITY ALERT</b> 🚨\n\n<b>${payload.title}</b>\n${payload.message}\n\nIP: <code>${payload.ip || 'Unknown'}</code>`;
    await this.telegramService.sendMessage(text);
  }

  @OnEvent('deployment.success')
  async handleDeploymentSuccess(payload: { projectName: string; domain?: string; timeMs: number }) {
    const isEnabled = await this.isNotificationEnabled('notifyDeployments');
    if (!isEnabled) return;

    const timeSec = (payload.timeMs / 1000).toFixed(1);
    const text = `✅ <b>DEPLOYMENT SUCCESS</b>\n\nProject: <b>${payload.projectName}</b>\nDuration: ${timeSec}s\nDomain: ${payload.domain || 'None'}`;
    await this.telegramService.sendMessage(text);
  }

  @OnEvent('deployment.failed')
  async handleDeploymentFailed(payload: { projectName: string; reason: string }) {
    const isEnabled = await this.isNotificationEnabled('notifyDeployments');
    if (!isEnabled) return;

    const text = `❌ <b>DEPLOYMENT FAILED</b>\n\nProject: <b>${payload.projectName}</b>\nError: ${payload.reason}`;
    await this.telegramService.sendMessage(text);
  }

  @OnEvent('system.alert')
  async handleSystemAlert(payload: { title: string; message: string }) {
    const isEnabled = await this.isNotificationEnabled('notifySystem');
    if (!isEnabled) return;

    const text = `⚠️ <b>SYSTEM ALERT</b>\n\n<b>${payload.title}</b>\n${payload.message}`;
    await this.telegramService.sendMessage(text);
  }

  @OnEvent('system.maintenance.toggled')
  async handleMaintenanceToggled(payload: { enabled: boolean }) {
    const text = payload.enabled 
      ? `⚙️ <b>ALERT: Portdock CAAS is now in Maintenance Mode</b>\n\nUsers are restricted to Read-Only mode.`
      : `✅ <b>System Maintenance Mode has been DISABLED</b>\n\nAll features have been restored for users.`;
    
    // We send this regardless of 'notifyMaintenance' setting itself since changing the setting 
    // to OFF would technically mean 'notifyMaintenance' is now false, but we still want the "DISABLED" message.
    await this.telegramService.sendMessage(text);
  }
}
