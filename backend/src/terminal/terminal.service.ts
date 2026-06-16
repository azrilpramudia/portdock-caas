import { Injectable, Logger } from '@nestjs/common';
import { DockerService } from '../docker/docker.service';

@Injectable()
export class TerminalService {
  private readonly logger = new Logger(TerminalService.name);

  constructor(private dockerService: DockerService) {}

  /**
   * Spawns an interactive docker exec session and pipes the output to the provided stream callbacks.
   */
  async spawnTerminal(
    dockerContainerId: string,
    command: string[],
    onData: (data: Buffer) => void,
    onExit: (code: number) => void,
    onError: (err: Error) => void,
  ): Promise<{ write: (data: string) => void; resize: (cols: number, rows: number) => void; kill: () => void }> {
    try {
      const docker = this.dockerService.getDocker();
      const container = docker.getContainer(dockerContainerId);
      
      const exec = await container.exec({
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: command,
        Env: ["TERM=xterm-256color"],
      });

      const stream = await exec.start({
        Tty: true,
        stdin: true,
        hijack: true,
      });

      stream.on('data', (chunk: Buffer) => {
        onData(chunk);
      });

      stream.on('end', () => {
        exec.inspect().then((data) => {
          onExit(data.ExitCode || 0);
        }).catch(() => onExit(0));
      });

      stream.on('error', (err) => {
        this.logger.error(`Terminal stream error for ${dockerContainerId}: ${err.message}`);
        onError(err);
      });

      return {
        write: (data: string) => {
          stream.write(data);
        },
        resize: (cols: number, rows: number) => {
          exec.resize({ w: cols, h: rows }).catch(() => {});
        },
        kill: () => {
          try {
            stream.destroy();
          } catch (e) {
            // Ignore if already dead
          }
        },
      };
    } catch (err) {
      this.logger.error(`Failed to spawn terminal for ${dockerContainerId}: ${err.message}`);
      onError(err);
      throw err;
    }
  }
}
