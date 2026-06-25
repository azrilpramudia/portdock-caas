import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'zod';
import { DatabaseType } from '@generated/prisma';

export const CreateDatabaseSchema = z.object({
  name: z.string().min(1).max(100).describe('Database name'),
  type: z.nativeEnum(DatabaseType).describe('Database type'),
  version: z.string().default('latest').describe('Database version'),
});

export class CreateDatabaseDto extends createZodDto(CreateDatabaseSchema) {}
