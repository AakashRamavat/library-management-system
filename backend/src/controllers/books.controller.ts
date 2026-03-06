import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../middleware/error-handler';
import * as booksService from '../services/books.service';
import { successResponse } from '../utils/response';
import type { CheckoutOrReturnInput } from '../validators/books.validator';
import { validateListBooksQuery } from '../validators/books.validator';

export async function listBooks(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = validateListBooksQuery(req.query);
    const data = await booksService.listBooks(query);
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
}

export async function checkoutBook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      next(new ApiError({ statusCode: 401, message: 'Unauthorized' }));
      return;
    }
    const input = req.validatedBody as CheckoutOrReturnInput;
    await booksService.checkoutBook(input, req.user.id);
    successResponse(res, { message: 'Book checked out successfully' }, 201);
  } catch (err) {
    next(err);
  }
}

export async function returnBook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      next(new ApiError({ statusCode: 401, message: 'Unauthorized' }));
      return;
    }
    const input = req.validatedBody as CheckoutOrReturnInput;
    await booksService.returnBook(input, req.user.id);
    successResponse(res, { message: 'Book returned successfully' }, 201);
  } catch (err) {
    next(err);
  }
}
