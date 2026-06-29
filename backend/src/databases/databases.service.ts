import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DockerService } from '../docker/docker.service';
import { CreateDatabaseDto } from './dto/create-database.dto';
import { DatabaseType, ContainerStatus } from '@generated/prisma';
import { randomBytes } from 'crypto';

@Injectable()
export class DatabasesService {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    private prisma: PrismaService,
    private docker: DockerService,
  ) {}

  async create(userId: string, dto: CreateDatabaseDto) {
    const dbPassword = randomBytes(8).toString('hex'); // 16 char password
    const dbUser = dto.type === DatabaseType.POSTGRESQL ? 'portdock' : null;
    const dbName = dto.type === DatabaseType.POSTGRESQL ? 'defaultdb' : null;

    // Create DB record first to get ID for volume naming
    const database = await this.prisma.managedDatabase.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        version: dto.version,
        dbUser,
        dbPassword,
        dbName,
        internalPort: dto.type === DatabaseType.POSTGRESQL ? 5432 : 6379,
        hostPort: 0, // placeholder, will update later
        volumeName: '',
      },
    });

    try {
      const volumeName = `portdock-dbvol-${database.id}`;
      await this.docker.createVolume(volumeName);

      const hostPort = await this.getAvailablePort();

      let imageName = '';
      let envVars: string[] = [];
      let cmd: string[] = [];
      let mountPath = '';

      if (dto.type === DatabaseType.POSTGRESQL) {
        imageName = `postgres:${dto.version === 'latest' ? '15-alpine' : dto.version}`;
        envVars = [
          `POSTGRES_USER=${dbUser}`,
          `POSTGRES_PASSWORD=${dbPassword}`,
          `POSTGRES_DB=${dbName}`,
        ];
        mountPath = '/var/lib/postgresql/data';
      } else if (dto.type === DatabaseType.REDIS) {
        imageName = `redis:${dto.version === 'latest' ? '7-alpine' : dto.version}`;
        cmd = ['redis-server', '--requirepass', dbPassword];
        mountPath = '/data';
      } else {
        throw new Error(`Database type ${dto.type} is not yet supported`);
      }

      await this.docker.pullImage(imageName);

      const containerName = `portdock-db-${database.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

      const createOptions: any = {
        name: containerName,
        Image: imageName,
        Env: envVars,
        ExposedPorts: { [`${database.internalPort}/tcp`]: {} },
        HostConfig: {
          PortBindings: {
            [`${database.internalPort}/tcp`]: [{ HostPort: `${hostPort}` }],
          },
          Binds: [`${volumeName}:${mountPath}`],
          RestartPolicy: { Name: 'unless-stopped' },
          Memory: 512 * 1024 * 1024,
          CpuQuota: 50000,
          LogConfig: {
            Type: 'json-file',
            Config: {
              'max-size': '10m',
              'max-file': '3',
            },
          },
        },
      };

      if (cmd.length > 0) {
        createOptions.Cmd = cmd;
      }

      const dockerContainer = await this.docker.createContainer(createOptions);
      const inspect = await dockerContainer.inspect();
      await dockerContainer.start();

      return await this.prisma.managedDatabase.update({
        where: { id: database.id },
        data: {
          dockerContainerId: inspect.Id,
          hostPort,
          volumeName,
          status: ContainerStatus.RUNNING,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to provision database: ${error.message}`,
        error.stack,
      );
      await this.prisma.managedDatabase.delete({ where: { id: database.id } });
      throw new InternalServerErrorException('Failed to provision database');
    }
  }

  async findAll(userId: string) {
    return this.prisma.managedDatabase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const db = await this.prisma.managedDatabase.findUnique({ where: { id } });
    if (!db) throw new NotFoundException('Database not found');
    if (db.userId !== userId) throw new ForbiddenException();
    return db;
  }

  async remove(userId: string, id: string) {
    const db = await this.findOne(userId, id);

    if (db.dockerContainerId) {
      try {
        await this.docker.stopContainer(db.dockerContainerId);
      } catch (e) {}
      try {
        await this.docker.removeContainer(db.dockerContainerId, true);
      } catch (e) {}
    }

    if (db.volumeName) {
      try {
        await this.docker.removeVolume(db.volumeName);
      } catch (e) {}
    }

    await this.prisma.managedDatabase.delete({ where: { id } });
    return { message: 'Database deleted successfully' };
  }

  // Simplified version of port finding logic
  private async getAvailablePort(): Promise<number> {
    const containers = await this.prisma.container.findMany({
      select: { hostPort: true },
      where: { hostPort: { not: null } },
    });
    const databases = await this.prisma.managedDatabase.findMany({
      select: { hostPort: true },
    });

    const usedPorts = new Set([
      ...containers.map((c) => c.hostPort),
      ...databases.map((d) => d.hostPort),
    ]);

    let port = 40000;
    while (usedPorts.has(port)) {
      port++;
    }
    return port;
  }
}
