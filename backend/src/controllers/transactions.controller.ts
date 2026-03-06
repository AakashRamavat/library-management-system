import type { NextFunction, Request, Response } from 'express';

import * as transactionsService from '../services/transactions.service';
import { successResponse } from '../utils/response';

export async function listTransactions(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await transactionsService.listTransactions();
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}
