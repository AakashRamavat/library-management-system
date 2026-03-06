import type { NextFunction, Request, Response } from 'express';

/**
 * Validation middleware – runs after auth, before controller.
 * Runs the validator on req.body and attaches the result to req.validatedBody.
 * Passes any validation error to the error handler via next(err).
 */
export function validate<T>(validator: (body: unknown) => T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      (req as Request & { validatedBody: T }).validatedBody = validator(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}
