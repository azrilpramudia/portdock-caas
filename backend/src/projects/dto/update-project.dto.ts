import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'zod';
import { ProjectStatus } from '@generated/prisma';
import { CreateProjectSchema } from './create-project.dto';

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  status: z.nativeEnum(ProjectStatus).optional(),
});

export class UpdateProjectDto extends createZodDto(UpdateProjectSchema) {}
