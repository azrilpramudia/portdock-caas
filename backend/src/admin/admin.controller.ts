import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, Request, Res, StreamableFile, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@generated/prisma';
import { ContainersService } from '../containers/containers.service';
import { UpdateResourcesDto } from '../containers/dto/update-resources.dto';
import { SystemService } from './system.service';
import { TelegramService } from '../notifications/telegram.service';
import { SecurityService } from './security.service';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly containersService: ContainersService,
    private readonly systemService: SystemService,
    private readonly telegramService: TelegramService,
    private readonly securityService: SecurityService,
    private readonly notificationsService: NotificationsService
  ) {}

  @Post('settings/test-telegram')
  async testTelegram(@Body() body: { token: string; chatId: string }) {
    const result = await this.telegramService.sendMessage(
      '👋 <b>Test Notification</b>\n\nThis is a test message from Portdock CAAS to verify your Telegram Bot configuration.',
      { token: body.token, chatId: body.chatId }
    );
    if (!result.success) {
      throw new BadRequestException(result.message || 'Failed to send test message');
    }
    return { success: true, message: 'Message sent successfully' };
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('settings')
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  async updateSettings(@Body() data: Record<string, string>) {
    await this.adminService.updateSettings(data);
    return { success: true, message: 'Settings updated successfully' };
  }

  @Get('monitoring')
  async getMonitoringStats(@Query('range') range?: string) {
    const [overview, serverInfo, services, topContainers] = await Promise.all([
      this.systemService.getSystemResources(),
      this.systemService.getServerInfo(),
      this.systemService.getServiceHealth(),
      this.systemService.getTopContainers(),
    ]);

    const historical = await this.systemService.getHistoricalStats(range || '7d');

    // Add uptime to overview to match frontend interface
    const overviewData = {
      ...overview,
      uptime: serverInfo.uptime
    };

    return {
      overview: overviewData,
      serverInfo,
      services,
      topContainers,
      historical
    };
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('projects')
  async getAllProjects(@Query() filters: any) {
    return this.adminService.getAllProjects(filters);
  }

  @Get('deployments')
  async getAllDeployments(@Query() filters: any) {
    return this.adminService.getAllDeployments(filters);
  }

  @Get('containers')
  async getAllContainers(@Query() filters: any) {
    return this.adminService.getAllContainers(filters);
  }

  @Get('activity-logs')
  async getAllActivityLogs(@Query() filters: any) {
    return this.adminService.getAllActivityLogs(filters);
  }

  @Get('activity-logs/export')
  @ApiOperation({ summary: 'Export all activity logs to CSV' })
  async exportAllActivityLogs(
    @Query() filters: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const csv = await this.adminService.exportAllActivityLogs(filters);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="admin-activity-logs-${new Date().toISOString().split('T')[0]}.csv"`,
    });
    return new StreamableFile(Buffer.from(csv));
  }

  @Post('containers/:id/start')
  async startContainer(@Param('id') id: string) {
    return this.adminService.startContainer(id);
  }

  @Post('containers/:id/stop')
  async stopContainer(@Param('id') id: string) {
    return this.adminService.stopContainer(id);
  }

  @Post('containers/:id/restart')
  async restartContainer(@Param('id') id: string) {
    return this.adminService.restartContainer(id);
  }

  @Delete('containers/:id')
  async deleteContainer(@Param('id') id: string) {
    return this.adminService.deleteContainer(id);
  }

  @Patch('containers/:id/resources')
  async updateContainerResources(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateResourcesDto,
  ) {
    // Pass isAdmin=true to bypass ownership checks
    return this.containersService.updateResources(id, req.user.id, dto, undefined, true);
  }

  @Patch('projects/:id')
  async updateProject(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProject(id, data);
  }

  @Post('projects/:id/suspend')
  async suspendProject(@Param('id') id: string) {
    return this.adminService.suspendProject(id);
  }

  @Post('projects/:id/resume')
  async resumeProject(@Param('id') id: string) {
    return this.adminService.resumeProject(id);
  }

  @Post('projects/:id/reset-status')
  async resetProjectStatus(@Param('id') id: string) {
    return this.adminService.resetProjectStatus(id);
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string) {
    return this.adminService.deleteProject(id);
  }

  @Post('users')
  async createUser(@Body() data: any) {
    return this.adminService.createUser(data);
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(id, data);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('server/action')
  async executeServerAction(@Body('action') action: string) {
    if (!action) {
      throw new Error('Action is required');
    }
    return this.systemService.executeAction(action);
  }

  @Get('server/logs')
  async getServerLogs() {
    const logs = await this.systemService.getSystemLogs();
    return { logs };
  }

  @Get('docker/config')
  async getDockerConfig() {
    return this.systemService.getDockerDaemonConfig();
  }

  @Patch('docker/config')
  async updateDockerConfig(@Body() config: any) {
    await this.systemService.updateDockerDaemonConfig(config);
    return { success: true, message: 'Docker configuration updated successfully' };
  }

  @Get('nginx/config')
  async getNginxConfig() {
    return this.systemService.getNginxConfig();
  }

  @Patch('nginx/config')
  async updateNginxConfig(@Body() config: any) {
    await this.systemService.updateNginxConfig(config);
    return { success: true };
  }

  @Get('db/config')
  async getDbConfig() {
    return this.systemService.getDbConfig();
  }

  @Patch('db/config')
  async updateDbConfig(@Body() config: any) {
    await this.systemService.updateDbConfig(config);
    return { success: true };
  }

  @Post('db/backup/run')
  async runDbBackup() {
    const res = await this.systemService.runDbBackup();
    return { success: true, message: `Backup berhasil disimpan dengan nama: ${res.filePath}` };
  }

  @Get('ssl/config')
  async getSslConfig() {
    return this.systemService.getSslConfig();
  }

  @Patch('ssl/config')
  async updateSslConfig(@Body() config: any) {
    await this.systemService.updateSslConfig(config);
    return { success: true };
  }

  @Get('backup/config')
  async getBackupConfig() {
    return this.systemService.getBackupConfig();
  }

  @Patch('backup/config')
  async updateBackupConfig(@Body() config: any) {
    await this.systemService.updateBackupConfig(config);
    return { success: true };
  }

  // ==========================
  // Security Endpoints
  // ==========================
  @Get('security/status')
  async getSecurityStatus() {
    const ufw = await this.securityService.getUfwStatus();
    const fail2ban = await this.securityService.getFail2BanStatus();
    const ssh = await this.securityService.getSshConfig();
    return { ufw, fail2ban, ssh };
  }

  @Post('security/ufw/toggle')
  async toggleUfw(@Body() body: { enable: boolean }) {
    return this.securityService.toggleUfw(body.enable);
  }

  @Post('security/ufw/rule')
  async addUfwRule(@Body() body: { port: string; protocol?: string }) {
    return this.securityService.addUfwRule(body.port, body.protocol);
  }

  @Delete('security/ufw/rule')
  async deleteUfwRule(@Body() body: { port: string; protocol?: string }) {
    return this.securityService.deleteUfwRule(body.port, body.protocol);
  }

  @Post('security/fail2ban')
  async configureFail2Ban(@Body() body: { enable: boolean; maxretry: number; bantime: number }) {
    return this.securityService.configureFail2Ban(body.enable, body.maxretry, body.bantime);
  }

  @Post('security/ssh')
  async updateSshConfig(@Body() body: { port: number; permitRootLogin: boolean }) {
    return this.securityService.updateSshConfig(body.port, body.permitRootLogin);
  }

  // ==========================
  // Notifications Endpoints
  // ==========================
  @Get('notifications/config')
  async getNotificationsConfig() {
    return this.notificationsService.getSettings();
  }

  @Patch('notifications/config')
  async updateNotificationsConfig(@Body() body: Record<string, any>) {
    await this.notificationsService.updateSettings(body);
    return { success: true };
  }

  @Post('notifications/test/webhook')
  async testWebhook(@Body() body: { url: string }) {
    return this.notificationsService.testWebhook(body.url);
  }

  @Post('notifications/test/email')
  async testEmail(@Body() body: { emailConfig: any; toEmail: string }) {
    return this.notificationsService.testEmail(body.emailConfig, body.toEmail);
  }

  // ==========================
  // Advanced Endpoints
  // ==========================
  @Get('advanced/env')
  async getGlobalEnv() {
    return this.systemService.getGlobalEnvVars();
  }

  @Patch('advanced/env')
  async updateGlobalEnv(@Body() body: { vars: Array<{ key: string; value: string }> }) {
    await this.systemService.updateGlobalEnvVars(body.vars);
    return { success: true };
  }

  @Post('advanced/factory-reset')
  async factoryReset() {
    return this.systemService.factoryReset();
  }
}
