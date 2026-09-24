import type { Request } from 'express';

export interface AdminTokenPayload {
  sub: string;
  jti: string;
  role: 'ADMIN';
}

export interface AuthenticatedAdminRequest extends Request {
  user: AdminTokenPayload;
}
