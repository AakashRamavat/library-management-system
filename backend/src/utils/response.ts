import type { Response } from 'express';

/**
 * Send a standardized success response.
 */
export function successResponse(
  res: Response,
  data: unknown,
  code = 200,
): Response {
  return res.status(code).json({
    code,
    data,
    status: true,
  });
}

/**
 * Send a standardized error response.
 */
export function errorResponse(
  res: Response,
  errorMessage = 'Something went wrong',
  code = 500,
  error: Record<string, unknown> = {},
): Response {
  return res.status(code).json({
    code,
    errorMessage,
    error,
    data: null,
    status: false,
  });
}
