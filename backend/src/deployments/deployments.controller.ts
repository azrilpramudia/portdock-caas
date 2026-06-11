import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeploymentsService } from './deployments.service';
import * as path from 'path';

@ApiTags('deployments')
@ApiBearerAuth()
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
        if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
          cb(null, true);
        } else {
          cb(new Error('Only ZIP files are allowed'), false);
        }
      },
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  deployZip(
    @Request() req: any,
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.deploymentsService.deployZip(req.user.id, projectId, file);
  }

  @Post(':projectId/github')
  @ApiOperation({ summary: 'Deploy from GitHub repository' })
  deployGithub(
    @Request() req: any,
    @Param('projectId') projectId: string,
    @Body() body: { repositoryUrl: string; branch?: string },
  ) {
    return this.deploymentsService.deployGithub(
      req.user.id,
      projectId,
      body.repositoryUrl,
      body.branch,
    );
  }
}
