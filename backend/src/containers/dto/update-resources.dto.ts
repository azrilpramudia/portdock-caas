import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'zod';

export const UpdateResourcesSchema = z.object({
  memoryLimit: z.number().min(128).max(512).nullable().optional(),
  cpuLimit: z.number().min(0.1).max(2).nullable().optional(),
  restartPolicy: z
    .enum(['no', 'always', 'on-failure', 'unless-stopped'])
    .optional(),
  volumeMountPath: z.string().nullable().optional(),
  internalPort: z.number().min(1).max(65535).optional(),
});

export class UpdateResourcesDto extends createZodDto(UpdateResourcesSchema) {}
