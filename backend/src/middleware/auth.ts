import type { NextFunction, Request, Response } from 'express';

import { errorResponse } from '../utils/response';
import { verifyAccessToken } from '../services/auth.service';

/**
 * JWT auth middleware – verifies Bearer access token and sets req.user.
 * Use on routes that require authentication.
 */
export function auth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    errorResponse(res, 'Missing or invalid Authorization header', 401);
    return;
  }
  const token = header.slice(7);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    errorResponse(res, 'Invalid or expired access token', 401);
    return;
  }
}
