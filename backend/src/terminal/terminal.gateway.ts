import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TerminalService } from './terminal.service';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/terminal',
})
export class TerminalGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TerminalGateway.name);
  private sessions: Map<
    string,
    {
      write?: (data: string) => void;
      resize?: (cols: number, rows: number) => void;
      kill: () => void;
    }
  > = new Map();
  private commandBuffers: Map<string, string> = new Map();
  private containerInfo: Map<
    string,
    { containerId: string; projectId: string; userId: string }
  > = new Map();

  constructor(
    private terminalService: TerminalService,
    private prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to terminal: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from terminal: ${client.id}`);
    this.cleanupSession(client.id);
  }

  @SubscribeMessage('connect_terminal')
  async handleConnectTerminal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { containerId: string },
  ) {
    this.logger.log(
      `Terminal connection request for container ${data.containerId} from client ${client.id}`,
    );

    try {
      // Find the docker container ID from our DB container ID
      const container = await this.prisma.container.findUnique({
        where: { id: data.containerId },
        include: { project: true },
      });

      if (!container || !container.dockerContainerId) {
        client.emit(
          'terminal_error',
          'Container not found or docker ID missing',
        );
        return;
      }

      this.containerInfo.set(client.id, {
        containerId: container.id,
        projectId: container.projectId,
        userId: container.project.userId,
      });
      this.commandBuffers.set(client.id, '');

      // Cleanup any existing session for this client
      this.cleanupSession(client.id);

      const session = await this.terminalService.spawnTerminal(
        container.dockerContainerId,
        [
          'sh',
          '-c',
          'export PROMPT_COMMAND=\'PS1="\\[\\e[1;32m\\]\\u@\\h\\[\\e[m\\]:\\[\\e[1;34m\\]\\w\\[\\e[m\\]\\$ "\'; if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi',
        ],
        (chunk) => {
          client.emit('terminal_output', chunk.toString());
        },
        (code) => {
          client.emit('terminal_exit', code);
          this.cleanupSession(client.id);
        },
        (err) => {
          client.emit('terminal_error', err.message);
          this.cleanupSession(client.id);
        },
      );

      this.sessions.set(client.id, session);
      client.emit('terminal_ready', { host: container.name });
    } catch (err) {
      client.emit('terminal_error', err.message);
    }
  }

  @SubscribeMessage('connect_app_logs')
  async handleConnectAppLogs(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { containerId: string },
  ) {
    this.logger.log(
      `App Logs connection request for container ${data.containerId} from client ${client.id}`,
    );

    try {
      const container = await this.prisma.container.findUnique({
        where: { id: data.containerId },
      });

      if (!container || !container.dockerContainerId) {
        client.emit(
          'app_logs_error',
          'Container not found or docker ID missing',
        );
        return;
      }

      // Cleanup any existing session for this client
      this.cleanupSession(client.id);

      const session = await this.terminalService.streamApplicationLogs(
        container.dockerContainerId,
        (chunk) => {
          client.emit('app_logs_output', chunk);
        },
        (err) => {
          client.emit('app_logs_error', err.message);
          this.cleanupSession(client.id);
        },
      );

      this.sessions.set(client.id, session);
      client.emit('app_logs_ready', { host: container.name });
    } catch (err) {
      client.emit('app_logs_error', err.message);
    }
  }

  @SubscribeMessage('terminal_input')
  handleTerminalInput(
    @ConnectedSocket() client: Socket,
    @MessageBody() input: string,
  ) {
    const session = this.sessions.get(client.id);
    if (session && session.write) {
      session.write(input);

      // Skip arrow keys and other control sequences
      if (input.startsWith('\x1b')) return;

      const buffer = this.commandBuffers.get(client.id) || '';
      if (input.includes('\r')) {
        const parts = input.split('\r');
        const finalCmd = (buffer + parts[0]).trim();

        if (finalCmd) {
          const info = this.containerInfo.get(client.id);
          if (info) {
            this.prisma.terminalLog
              .create({
                data: {
                  userId: info.userId,
                  projectId: info.projectId,
                  command: finalCmd,
                },
              })
              .catch((err) =>
                this.logger.error(
                  `Failed to save terminal log: ${err.message}`,
                ),
              );
          }
        }
        this.commandBuffers.set(client.id, '');
      } else if (input === '\u007F') {
        // Backspace
        this.commandBuffers.set(client.id, buffer.slice(0, -1));
      } else {
        const printable = input.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        this.commandBuffers.set(client.id, buffer + printable);
      }
    }
  }

  @SubscribeMessage('terminal_resize')
  handleTerminalResize(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { cols: number; rows: number },
  ) {
    const session = this.sessions.get(client.id);
    if (
      session &&
      data &&
      typeof data.cols === 'number' &&
      typeof data.rows === 'number' &&
      session.resize
    ) {
      session.resize(data.cols, data.rows);
    }
  }

  private cleanupSession(clientId: string) {
    const session = this.sessions.get(clientId);
    if (session) {
      session.kill();
      this.sessions.delete(clientId);
      this.commandBuffers.delete(clientId);
      this.containerInfo.delete(clientId);
    }
  }
}
