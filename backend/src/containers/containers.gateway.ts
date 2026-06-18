import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { DockerService } from '../docker/docker.service';
import { PrismaService } from '../prisma/prisma.service';
import { PassThrough } from 'stream';

@WebSocketGateway({ cors: { origin: '*' } })
export class ContainersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ContainersGateway.name);

  // Map to track active streams
  private logStreams = new Map<string, NodeJS.ReadableStream>();
  private execStreams = new Map<string, any>();

  constructor(
    private docker: DockerService,
    private prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.cleanupClientStreams(client.id);
  }

  @SubscribeMessage('subscribeLogs')
  async handleSubscribeLogs(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { containerId: string },
  ) {
    const { containerId } = data;
    this.logger.log(
      `Client ${client.id} subscribing to logs for ${containerId}`,
    );

    try {
      const dbContainer = await this.prisma.container.findUnique({
        where: { id: containerId },
      });

      if (!dbContainer || !dbContainer.dockerContainerId) {
        client.emit('error', 'Container not found or not deployed yet');
        return;
      }

      const dockerContainer = await this.docker.getContainer(
        dbContainer.dockerContainerId,
      );

      const stream = await dockerContainer.logs({
        follow: true,
        stdout: true,
        stderr: true,
        tail: 100,
      });

      const passThrough = new PassThrough();

      try {
        // Demultiplex the stream (Docker adds 8-byte headers to stdout/stderr if TTY is false)
        dockerContainer.modem.demuxStream(stream, passThrough, passThrough);
      } catch (e) {
        // Fallback if demux fails (e.g. TTY is true)
        stream.pipe(passThrough);
      }

      // Avoid memory leaks and multiple streams
      const streamId = `${client.id}-logs-${containerId}`;
      this.logStreams.set(streamId, stream as any);

      passThrough.on('data', (chunk) => {
        client.emit(`logs-${containerId}`, chunk.toString('utf-8'));
      });

      stream.on('end', () => {
        client.emit(`logs-${containerId}`, '\r\n[Connection Closed]\r\n');
        passThrough.end();
      });

      client.on('disconnect', () => {
        if (stream && (stream as any).destroy) {
          (stream as any).destroy();
        }
        this.logStreams.delete(streamId);
      });
    } catch (err) {
      this.logger.error(`Logs error: ${err.message}`);
      client.emit('error', `Failed to stream logs: ${err.message}`);
    }
  }

  @SubscribeMessage('startTerminal')
  async handleStartTerminal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { containerId: string },
  ) {
    const { containerId } = data;
    this.logger.log(`Client ${client.id} starting terminal for ${containerId}`);

    try {
      const dbContainer = await this.prisma.container.findUnique({
        where: { id: containerId },
      });

      if (!dbContainer || !dbContainer.dockerContainerId) {
        client.emit('error', 'Container not found or not deployed yet');
        return;
      }

      const dockerContainer = await this.docker.getContainer(
        dbContainer.dockerContainerId,
      );

      const exec = await dockerContainer.exec({
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/sh'],
      });

      const stream = await exec.start({
        hijack: true,
        stdin: true,
      });

      const execId = `${client.id}-term-${containerId}`;
      this.execStreams.set(execId, stream);

      stream.on('data', (chunk) => {
        client.emit(`terminalOutput-${containerId}`, chunk.toString('utf-8'));
      });

      client.on('disconnect', () => {
        if (stream && stream.end) {
          stream.end();
        }
        this.execStreams.delete(execId);
      });
    } catch (err) {
      this.logger.error(`Terminal error: ${err.message}`);
      client.emit('error', `Failed to start terminal: ${err.message}`);
    }
  }

  @SubscribeMessage('terminalInput')
  handleTerminalInput(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { containerId: string; input: string },
  ) {
    const execId = `${client.id}-term-${data.containerId}`;
    const stream = this.execStreams.get(execId);
    if (stream) {
      stream.write(data.input);
    }
  }

  private cleanupClientStreams(clientId: string) {
    // Cleanup logs
    for (const [key, stream] of this.logStreams.entries()) {
      if (key.startsWith(`${clientId}-`)) {
        if ((stream as any).destroy) (stream as any).destroy();
        this.logStreams.delete(key);
      }
    }

    // Cleanup execs
    for (const [key, stream] of this.execStreams.entries()) {
      if (key.startsWith(`${clientId}-`)) {
        if (stream.end) stream.end();
        this.execStreams.delete(key);
      }
    }
  }
}
