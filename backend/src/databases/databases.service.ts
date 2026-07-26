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
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class DatabasesService {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    private prisma: PrismaService,
    private docker: DockerService,
  ) {}

  async create(userId: string, dto: CreateDatabaseDto, ip?: string) {
    const dbPassword = crypto.randomBytes(8).toString('hex'); // 16 char password
    const dbUser = dto.type === DatabaseType.POSTGRESQL || dto.type === DatabaseType.MYSQL ? 'portdock' : null;
    const dbName = dto.type === DatabaseType.POSTGRESQL || dto.type === DatabaseType.MYSQL ? dto.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : null;

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
        internalPort: dto.type === DatabaseType.POSTGRESQL ? 5432 : dto.type === DatabaseType.MYSQL ? 3306 : 6379,
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
        cmd = ['postgres', '-c', `max_connections=${database.maxConnections || 100}`];
        mountPath = '/var/lib/postgresql/data';
      } else if (dto.type === DatabaseType.MYSQL) {
        imageName = `mysql:${dto.version === 'latest' ? '8' : dto.version}`;
        envVars = [
          `MYSQL_USER=${dbUser}`,
          `MYSQL_PASSWORD=${dbPassword}`,
          `MYSQL_DATABASE=${dbName}`,
          `MYSQL_ROOT_PASSWORD=${crypto.randomBytes(12).toString('hex')}`,
        ];
        const mysqlMemory = database.memoryLimit || 512;
        cmd = [
          `--max_connections=${database.maxConnections || 100}`,
          `--performance-schema=0`,
          `--innodb-buffer-pool-size=${Math.max(64, Math.floor(mysqlMemory / 4))}M`,
        ];
        mountPath = '/var/lib/mysql';
      } else {
        throw new Error(`Database type ${dto.type} is not yet supported`);
      }

      const hasImage = await this.docker.imageExists(imageName);
      if (!hasImage) {
        this.logger.log(`Pulling Docker image: ${imageName}. This may take a few minutes depending on your internet connection...`);
        await this.docker.pullImage(imageName);
        this.logger.log(`Successfully pulled image ${imageName}.`);
      } else {
        this.logger.log(`Image ${imageName} already exists locally. Skipping pull.`);
      }
      this.logger.log(`Provisioning container...`);

      const containerName = `portdock-db-${database.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      const createOptions: any = {
        name: containerName,
        Image: imageName,
        Env: envVars,
        ExposedPorts: { [`${database.internalPort}/tcp`]: {} },
        Cmd: cmd.length > 0 ? cmd : undefined,
        HostConfig: {
          NetworkMode: 'portdock-net',
          PortBindings: {
            [`${database.internalPort}/tcp`]: [{ HostPort: `${hostPort}` }],
          },
          Binds: [`${volumeName}:${mountPath}`],
          RestartPolicy: { Name: 'unless-stopped' },
          Memory: (database.memoryLimit || 512) * 1024 * 1024,
          CpuQuota: (database.cpuLimit || 0.5) * 100000,
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

      this.logger.log(`Database container ${containerName} started successfully on port ${hostPort}`);

      const updatedDb = await this.prisma.managedDatabase.update({
        where: { id: database.id },
        data: {
          dockerContainerId: inspect.Id,
          hostPort,
          volumeName,
          status: ContainerStatus.RUNNING,
        },
      });

      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'Create Database',
          description: `Provisioned managed database: ${database.name}`,
          status: 'Success',
          ipAddress: ip,
        },
      });

      return updatedDb;
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

  async findOne(userId: string | null, id: string, isAdmin: boolean = false) {
    const db = await this.prisma.managedDatabase.findUnique({ where: { id } });
    if (!db) throw new NotFoundException('Database not found');
    if (!isAdmin && db.userId !== userId) throw new ForbiddenException();
    return db;
  }

  async start(userId: string, id: string, ip?: string) {
    const db = await this.findOne(userId, id);
    if (!db.dockerContainerId) throw new InternalServerErrorException('Database container ID not found');
    
    await this.docker.startContainer(db.dockerContainerId);
    
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'Start Database',
        description: `Started managed database: ${db.name}`,
        status: 'Success',
        ipAddress: ip,
      },
    });

    return this.prisma.managedDatabase.update({
      where: { id },
      data: { status: ContainerStatus.RUNNING },
    });
  }

  async stop(userId: string, id: string, ip?: string) {
    const db = await this.findOne(userId, id);
    if (!db.dockerContainerId) throw new InternalServerErrorException('Database container ID not found');
    
    await this.docker.stopContainer(db.dockerContainerId);
    
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'Stop Database',
        description: `Stopped managed database: ${db.name}`,
        status: 'Success',
        ipAddress: ip,
      },
    });

    return this.prisma.managedDatabase.update({
      where: { id },
      data: { status: ContainerStatus.STOPPED },
    });
  }

  async restart(userId: string, id: string, ip?: string) {
    const db = await this.findOne(userId, id);
    if (!db.dockerContainerId) throw new InternalServerErrorException('Database container ID not found');
    
    await this.docker.restartContainer(db.dockerContainerId);
    
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'Restart Database',
        description: `Restarted managed database: ${db.name}`,
        status: 'Success',
        ipAddress: ip,
      },
    });

    return this.prisma.managedDatabase.update({
      where: { id },
      data: { status: ContainerStatus.RUNNING },
    });
  }

  async remove(userId: string, id: string, ip?: string) {
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
    
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'Delete Database',
        description: `Deleted managed database: ${db.name}`,
        status: 'Success',
        ipAddress: ip,
      },
    });

    return { message: 'Database deleted successfully' };
  }

  // Backup & Restore
  
  async listBackups(userId: string, id: string) {
    const db = await this.findOne(userId, id);
    return this.prisma.databaseBackup.findMany({
      where: { managedDatabaseId: db.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createBackup(userId: string, id: string, ip?: string) {
    const db = await this.findOne(userId, id);
    if (!db.dockerContainerId || db.status !== ContainerStatus.RUNNING) {
      throw new InternalServerErrorException('Database must be running to create a backup');
    }

    const filename = `${db.name}-backup-${Date.now()}.sql`;
    const backupsDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    const filepath = path.join(backupsDir, filename);

    // Create DB record with PENDING status
    const backup = await this.prisma.databaseBackup.create({
      data: {
        managedDatabaseId: db.id,
        filename,
        status: 'PENDING'
      }
    });

    try {
      let command = '';
      if (db.type === 'POSTGRESQL') {
        command = `docker exec ${db.dockerContainerId} pg_dump -U ${db.dbUser} ${db.dbName} > ${filepath}`;
      } else if (db.type === 'MYSQL') {
        command = `docker exec ${db.dockerContainerId} mysqldump -u ${db.dbUser} -p${db.dbPassword} ${db.dbName} > ${filepath}`;
      } else {
        throw new Error('Unsupported database type for backup');
      }

      await execAsync(command);

      const stats = fs.statSync(filepath);
      await this.prisma.databaseBackup.update({
        where: { id: backup.id },
        data: { status: 'SUCCESS', sizeBytes: stats.size }
      });

      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'Create Backup',
          description: `Created backup for database: ${db.name}`,
          status: 'Success',
          ipAddress: ip,
        },
      });

      return await this.prisma.databaseBackup.findUnique({ where: { id: backup.id } });
    } catch (error) {
      this.logger.error(`Failed to create backup: ${error.message}`);
      await this.prisma.databaseBackup.update({
        where: { id: backup.id },
        data: { status: 'FAILED' }
      });
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      throw new InternalServerErrorException('Failed to create backup');
    }
  }

  async restoreBackup(userId: string, id: string, backupId: string, ip?: string) {
    const db = await this.findOne(userId, id);
    if (!db.dockerContainerId || db.status !== ContainerStatus.RUNNING) {
      throw new InternalServerErrorException('Database must be running to restore a backup');
    }

    const backup = await this.prisma.databaseBackup.findUnique({
      where: { id: backupId }
    });

    if (!backup || backup.managedDatabaseId !== db.id) {
      throw new NotFoundException('Backup not found');
    }

    const filepath = path.join(process.cwd(), 'backups', backup.filename);
    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Backup file not found on disk');
    }

    try {
      let command = '';
      if (db.type === 'POSTGRESQL') {
        command = `cat ${filepath} | docker exec -i ${db.dockerContainerId} psql -U ${db.dbUser} -d ${db.dbName}`;
      } else if (db.type === 'MYSQL') {
        command = `cat ${filepath} | docker exec -i ${db.dockerContainerId} mysql -u ${db.dbUser} -p${db.dbPassword} ${db.dbName}`;
      }

      await execAsync(command);

      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'Restore Backup',
          description: `Restored backup for database: ${db.name}`,
          status: 'Success',
          ipAddress: ip,
        },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to restore backup: ${error.message}`);
      throw new InternalServerErrorException('Failed to restore backup');
    }
  }

  async deleteBackup(userId: string, id: string, backupId: string) {
    const db = await this.findOne(userId, id);
    const backup = await this.prisma.databaseBackup.findUnique({
      where: { id: backupId }
    });

    if (!backup || backup.managedDatabaseId !== db.id) {
      throw new NotFoundException('Backup not found');
    }

    const filepath = path.join(process.cwd(), 'backups', backup.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await this.prisma.databaseBackup.delete({
      where: { id: backupId }
    });

    return { success: true };
  }

  async getStats(userId: string, id: string) {
    const db = await this.findOne(userId, id);
    if (!db.dockerContainerId) return null;

    try {
      const { stdout } = await promisify(exec)(`docker stats --no-stream --format '{"cpu":"{{.CPUPerc}}","ram":"{{.MemUsage}}"}' ${db.dockerContainerId}`);
      if (!stdout) return null;
      return JSON.parse(stdout.trim());
    } catch (error) {
      this.logger.error(`Failed to get stats for db ${id}:`, error);
      return null;
    }
  }

  async updateConfig(userId: string | null, id: string, dto: { cpuLimit?: number; memoryLimit?: number; maxConnections?: number }, ip?: string, isAdmin: boolean = false) {
    const db = await this.findOne(userId, id, isAdmin);
    
    // Update database record
    const updatedDb = await this.prisma.managedDatabase.update({
      where: { id },
      data: {
        cpuLimit: dto.cpuLimit !== undefined ? dto.cpuLimit : db.cpuLimit,
        memoryLimit: dto.memoryLimit !== undefined ? dto.memoryLimit : db.memoryLimit,
        maxConnections: dto.maxConnections !== undefined ? dto.maxConnections : db.maxConnections,
      }
    });

    // If container is running, we need to restart it to apply config
    // Actually, to apply new Cmd (max_connections) or Memory, we must recreate the container.
    // docker update can change memory/cpu but not Cmd.
    // A full recreate is safest since this is just a quick action.
    if (db.dockerContainerId && db.status === ContainerStatus.RUNNING) {
      try {
        await this.docker.stopContainer(db.dockerContainerId);
        await this.docker.removeContainer(db.dockerContainerId, true);
        
        let imageName = '';
        let envVars: string[] = [];
        let cmd: string[] = [];
        let mountPath = '';

        if (db.type === DatabaseType.POSTGRESQL) {
          imageName = `postgres:${db.version === 'latest' ? '15-alpine' : db.version}`;
          envVars = [
            `POSTGRES_USER=${db.dbUser}`,
            `POSTGRES_PASSWORD=${db.dbPassword}`,
            `POSTGRES_DB=${db.dbName}`,
          ];
          cmd = ['postgres', '-c', `max_connections=${updatedDb.maxConnections || 100}`];
          mountPath = '/var/lib/postgresql/data';
        } else if (db.type === DatabaseType.MYSQL) {
          imageName = `mysql:${db.version === 'latest' ? '8' : db.version}`;
          envVars = [
            `MYSQL_USER=${db.dbUser}`,
            `MYSQL_PASSWORD=${db.dbPassword}`,
            `MYSQL_DATABASE=${db.dbName}`,
            // We assume ROOT password doesn't matter much for restarts since data is persisted
            `MYSQL_ROOT_PASSWORD=${crypto.randomBytes(12).toString('hex')}`,
          ];
          const mysqlMemory = updatedDb.memoryLimit || 512;
          cmd = [
            `--max_connections=${updatedDb.maxConnections || 100}`,
            `--performance-schema=0`,
            `--innodb-buffer-pool-size=${Math.max(64, Math.floor(mysqlMemory / 4))}M`,
          ];
          mountPath = '/var/lib/mysql';
        }

        const containerName = `portdock-db-${db.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
        
        const createOptions: any = {
          name: containerName,
          Image: imageName,
          Env: envVars,
          ExposedPorts: { [`${db.internalPort}/tcp`]: {} },
          Cmd: cmd.length > 0 ? cmd : undefined,
          HostConfig: {
            NetworkMode: 'portdock-net',
            PortBindings: {
              [`${db.internalPort}/tcp`]: [{ HostPort: `${db.hostPort}` }],
            },
            Binds: [`${db.volumeName}:${mountPath}`],
            RestartPolicy: { Name: 'unless-stopped' },
            Memory: (updatedDb.memoryLimit || 512) * 1024 * 1024,
            CpuQuota: (updatedDb.cpuLimit || 0.5) * 100000,
            LogConfig: {
              Type: 'json-file',
              Config: {
                'max-size': '10m',
                'max-file': '3',
              },
            },
          },
        };

        const containerInfo = await this.docker.createContainer(createOptions);
        await this.docker.startContainer(containerInfo.id);

        await this.prisma.managedDatabase.update({
          where: { id },
          data: { dockerContainerId: containerInfo.id }
        });

      } catch (e) {
        this.logger.error(`Error recreating container for config update: ${e.message}`);
      }
    }

    return updatedDb;
  }

  async getBackupRecord(backupId: string) {
    const backup = await this.prisma.databaseBackup.findUnique({
      where: { id: backupId }
    });
    if (!backup) throw new NotFoundException('Backup not found');
    return backup;
  }

  async getBackupStream(userId: string, id: string, backupId: string) {
    const db = await this.findOne(userId, id);
    const backup = await this.getBackupRecord(backupId);

    if (backup.managedDatabaseId !== db.id) {
      throw new NotFoundException('Backup not found');
    }

    const filepath = path.join(process.cwd(), 'backups', backup.filename);
    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Backup file not found on disk');
    }

    return fs.createReadStream(filepath);
  }

  async resetPassword(userId: string, id: string, isAdmin: boolean = false) {
    const database = await this.findOne(userId, id, isAdmin);
    if (!database.dockerContainerId) throw new Error('Database container not initialized');
    if (database.status !== ContainerStatus.RUNNING) {
      throw new Error('Database must be running to reset password');
    }
    if (database.type !== DatabaseType.POSTGRESQL && database.type !== DatabaseType.MYSQL) {
      throw new Error('Password reset is only supported for PostgreSQL and MySQL');
    }

    const newPassword = crypto.randomBytes(8).toString('hex');
    let cmd: string[] = [];

    if (database.type === DatabaseType.POSTGRESQL) {
      cmd = ['sh', '-c', `PGPASSWORD='${database.dbPassword}' psql -U "${database.dbUser}" -d "${database.dbName || 'postgres'}" -c "ALTER USER \\"${database.dbUser}\\" WITH PASSWORD '${newPassword}';"`];
    } else if (database.type === DatabaseType.MYSQL) {
      cmd = ['sh', '-c', `MYSQL_PWD='${database.dbPassword}' mysql -u "${database.dbUser}" -e "ALTER USER '${database.dbUser}'@'%' IDENTIFIED BY '${newPassword}';"`];
    }

    try {
      const container = await this.docker.getContainer(database.dockerContainerId);
      const exec = await container.exec({
        Cmd: cmd,
        AttachStdout: true,
        AttachStderr: true,
      });
      const stream = await exec.start({});
      
      // Wait for execution to finish and consume stream to prevent hanging
      let output = '';
      await new Promise((resolve, reject) => {
        stream.on('data', (chunk) => { output += chunk.toString(); });
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      const inspect = await exec.inspect();
      if (inspect.ExitCode !== 0) {
        throw new Error(`Command failed with exit code ${inspect.ExitCode}: ${output}`);
      }

      const updated = await this.prisma.managedDatabase.update({
        where: { id },
        data: { dbPassword: newPassword },
      });

      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'Reset Database Password',
          description: `Reset password for database: ${database.name}`,
          status: 'Success',
        },
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to reset password: ${error.message}`, error.stack);
      throw new Error('Failed to reset password');
    }
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
