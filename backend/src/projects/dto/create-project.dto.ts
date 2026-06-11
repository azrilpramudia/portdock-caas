import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'zod';
import { DeploymentType } from '@generated/prisma';

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100).describe('Project name'),
  description: z.string().max(500).optional().describe('Project description'),
  deploymentType: z.nativeEnum(DeploymentType).describe('Deployment type'),
  repositoryUrl: z.string().url().optional().describe('GitHub repository URL'),
  domain: z.string().optional().describe('Custom domain'),
});

export class CreateProjectDto extends createZodDto(CreateProjectSchema) {}
