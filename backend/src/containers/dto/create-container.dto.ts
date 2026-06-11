import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'zod';

export const CreateContainerSchema = z.object({
  name: z.string().min(1).describe('Container name'),
  imageName: z.string().min(1).describe('Docker image name'),
  imageTag: z.string().optional().describe('Docker image tag'),
  internalPort: z.number().min(1).max(65535).describe('Internal port exposed by image'),
  hostPort: z.number().min(1024).max(65535).optional().describe('Host port to map to'),
  subdomain: z.string().optional().describe('Subdomain for routing'),
});

export class CreateContainerDto extends createZodDto(CreateContainerSchema) {}
