import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { SystemService } from './system.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/admin/metrics',
})
export class MetricsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MetricsGateway.name);
  private broadcastInterval: NodeJS.Timeout | null = null;
  private connectedClients = 0;

  constructor(private readonly systemService: SystemService) {}

  handleConnection(client: Socket) {
    this.connectedClients++;
    this.logger.log(`Client connected: ${client.id}. Total: ${this.connectedClients}`);
    
    if (this.connectedClients === 1 && !this.broadcastInterval) {
      this.startBroadcasting();
    }
    this.sendStatsToClient(client);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients--;
    this.logger.log(`Client disconnected: ${client.id}. Total: ${this.connectedClients}`);
    
    if (this.connectedClients === 0 && this.broadcastInterval) {
      this.stopBroadcasting();
    }
  }

  private async fetchMonitoringStats() {
    const [overview, serverInfo, services, topContainers] = await Promise.all([
      this.systemService.getSystemResources(),
      this.systemService.getServerInfo(),
      this.systemService.getServiceHealth(),
      this.systemService.getTopContainers(),
    ]);
    const historical = await this.systemService.getHistoricalStats('7d');
    const overviewData = {
      ...overview,
      uptime: serverInfo.uptime,
    };
    return {
      overview: overviewData,
      serverInfo,
      services,
      topContainers,
      historical,
    };
  }

  private async sendStatsToClient(client: Socket) {
    try {
      const stats = await this.fetchMonitoringStats();
      client.emit('monitoringStats', stats);
    } catch (e: any) {
      this.logger.error('Failed to send initial stats', e);
    }
  }

  private startBroadcasting() {
    this.logger.log('Starting metrics broadcast (interval: 3s)');
    this.broadcastInterval = setInterval(async () => {
      try {
        const stats = await this.fetchMonitoringStats();
        this.server.emit('monitoringStats', stats);
      } catch (e: any) {
        this.logger.error('Failed to broadcast metrics', e);
      }
    }, 3000);
  }

  private stopBroadcasting() {
    this.logger.log('Stopping metrics broadcast (no clients)');
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
  }
}
