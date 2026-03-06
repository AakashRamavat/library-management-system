import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../middleware/error-handler';
import * as booksService from '../services/books.service';
import { successResponse } from '../utils/response';
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

export async function checkoutBooks(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      next(new ApiError({ statusCode: 401, message: 'Unauthorized' }));
      return;
    }
    const input = req.validatedBody as import('../validators/books.validator').CheckoutInput;
    const { checkedOut } = await booksService.checkoutBooks(input, req.user.id);
    successResponse(
      res,
      { message: checkedOut === 1 ? 'Book checked out successfully' : `${checkedOut} books checked out successfully` },
      201,
    );
  } catch (err) {
    next(err);
  }
}

export async function returnBooks(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      next(new ApiError({ statusCode: 401, message: 'Unauthorized' }));
      return;
    }
    const input = req.validatedBody as import('../validators/books.validator').ReturnInput;
    const { returned } = await booksService.returnBooks(input, req.user.id);
    successResponse(
      res,
      { message: returned === 1 ? 'Book returned successfully' : `${returned} books returned successfully` },
      201,
    );
  } catch (err) {
    next(err);
  }
}
