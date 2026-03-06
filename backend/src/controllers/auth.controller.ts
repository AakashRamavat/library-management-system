import type { NextFunction, Request, Response } from 'express';

import * as authService from '../services/auth.service';
import { successResponse } from '../utils/response';
import type { LoginInput, RefreshInput, SignUpInput } from '../validators/auth.validator';

export async function signUp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.validatedBody as SignUpInput;
    const result = await authService.signUp(input);
    successResponse(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.validatedBody as LoginInput;
    const result = await authService.login(input);
    successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.validatedBody as RefreshInput;
    const result = await authService.refresh(input);
    successResponse(res, result);
  } catch (err) {
    next(err);
  }
}
