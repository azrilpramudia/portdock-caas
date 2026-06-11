import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(1).max(100).describe('User name'),
  email: z.string().email().describe('Email address'),
  password: z.string().min(8).describe('Password (min 8 chars)'),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
