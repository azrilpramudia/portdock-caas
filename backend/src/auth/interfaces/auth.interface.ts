import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  sessionId?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
