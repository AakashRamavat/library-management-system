import { Router } from 'express';

import * as booksController from '../controllers/books.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { validateCheckoutBody, validateReturnBody } from '../validators/books.validator';

export const router = Router();

router.get('/', auth, booksController.listBooks);

router.post(
  '/checkout',
  auth,
  validate(validateCheckoutBody),
  booksController.checkoutBooks,
);

router.post(
  '/return',
  auth,
  validate(validateReturnBody),
  booksController.returnBooks,
);
