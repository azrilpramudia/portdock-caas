import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email().describe('Email address'),
  password: z.string().min(1).describe('Password'),
  turnstileToken: z.string().optional().describe('Cloudflare Turnstile token'),
});

export class LoginDto extends createZodDto(LoginSchema) {}
