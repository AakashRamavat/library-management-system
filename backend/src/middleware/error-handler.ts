import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { errorResponse } from '../utils/response';

interface ApiErrorPayload {
  statusCode: number;
  message: string;
  details?: unknown;
}

// Simple error class to throw from services/controllers
export class ApiError extends Error {
  statusCode: number;

  details?: unknown;

  constructor({ statusCode, message, details }: ApiErrorPayload) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    const errorDetails =
      err.details != null && typeof err.details === 'object' && !Array.isArray(err.details)
        ? (err.details as Record<string, unknown>)
        : {};
    errorResponse(res, err.message, err.statusCode, errorDetails);
    return;
  }

  if (err instanceof ZodError) {
    const flattened = err.flatten();
    const message =
      flattened.formErrors[0] ?? err.errors[0]?.message ?? 'Validation failed';
    const details =
      Object.keys(flattened.fieldErrors).length > 0
        ? (flattened.fieldErrors as Record<string, unknown>)
        : {};
    errorResponse(res, String(message), 400, details);
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);

  errorResponse(res, 'Internal server error', 500);
}

