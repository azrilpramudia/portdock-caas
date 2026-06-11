import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email().describe('Email address'),
  password: z.string().min(1).describe('Password'),
});

export class LoginDto extends createZodDto(LoginSchema) {}
