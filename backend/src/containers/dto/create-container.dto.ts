import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'zod';

export const CreateContainerSchema = z.object({
  name: z.string().min(1).describe('Container name'),
  imageName: z.string().min(1).describe('Docker image name'),
  imageTag: z.string().optional().describe('Docker image tag'),
  internalPort: z
    .number()
    .min(1)
    .max(65535)
    .describe('Internal port exposed by image'),
  hostPort: z
    .number()
    .min(1024)
    .max(65535)
    .optional()
    .describe('Host port to map to'),
  subdomain: z.string().optional().describe('Subdomain for routing'),
  memoryLimit: z
    .number()
    .min(128)
    .max(512)
    .optional()
    .default(512)
    .describe('Memory limit in MB (max 512)'),
  cpuLimit: z
    .number()
    .min(0.1)
    .max(0.5)
    .optional()
    .default(0.5)
    .describe('CPU core limit (max 0.5)'),
});

export class CreateContainerDto extends createZodDto(CreateContainerSchema) {}
