import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Ip,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/auth.interface';
import { DeploymentsService } from './deployments.service';
import * as path from 'path';

@ApiTags('deployments')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('deployments')
export class DeploymentsController {
  constructor(private deploymentsService: DeploymentsService) {}

  @Post(':projectId/zip')
  @ApiOperation({ summary: 'Deploy from ZIP file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/tmp',
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (
          file.mimetype === 'application/zip' ||
          file.originalname.endsWith('.zip')
        ) {
          cb(null, true);
        } else {
          cb(new Error('Only ZIP files are allowed'), false);
        }
      },
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  deployZip(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('memoryLimit') memoryLimit?: string,
    @Body('cpuLimit') cpuLimit?: string,
    @Body('internalPort') internalPort?: string,
    @Ip() ip?: string,
  ) {
    console.log('--- DEPLOY ZIP PAYLOAD ---', {
      memoryLimit,
      cpuLimit,
      internalPort,
      ip,
    });
    return this.deploymentsService.deployZip(
      req.user.id,
      projectId,
      file,
      Number(memoryLimit) || 512,
      Number(cpuLimit) || 1.0,
      internalPort ? Number(internalPort) : undefined,
      ip,
    );
  }

  @Post(':projectId/github')
  @ApiOperation({ summary: 'Deploy from GitHub repository' })
  deployGithub(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @Body()
    body: {
      repositoryUrl: string;
      branch?: string;
      memoryLimit?: number;
      cpuLimit?: number;
      internalPort?: string;
    },
    @Body('internalPort') internalPort?: string,
    @Ip() ip?: string,
  ) {
    console.log('--- DEPLOY GITHUB PAYLOAD ---', { ...body, ip });
    return this.deploymentsService.deployGithub(
      req.user.id,
      projectId,
      body.repositoryUrl,
      body.branch,
      body.memoryLimit || 512,
      body.cpuLimit || 1.0,
      internalPort ? Number(internalPort) : undefined,
      ip,
    );
  }

  @Post(':projectId/dockerfile')
  @ApiOperation({ summary: 'Deploy from Custom Dockerfile' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/tmp',
        filename: (_req, file, cb) => {
          cb(
            null,
            `dockerfile-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          );
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.originalname.toLowerCase().includes('dockerfile')) {
          cb(null, true);
        } else {
          cb(new Error('Hanya file Dockerfile yang diizinkan!'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for Dockerfile
    }),
  )
  deployDockerfile(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('memoryLimit') memoryLimit?: string,
    @Body('cpuLimit') cpuLimit?: string,
    @Body('internalPort') internalPort?: string,
    @Ip() ip?: string,
  ) {
    console.log('--- DEPLOY DOCKERFILE PAYLOAD ---', {
      memoryLimit,
      cpuLimit,
      internalPort,
      ip,
    });
    return this.deploymentsService.deployDockerfile(
      req.user.id,
      projectId,
      file,
      Number(memoryLimit) || 512,
      Number(cpuLimit) || 1.0,
      internalPort ? Number(internalPort) : undefined,
      ip,
    );
  }
}
