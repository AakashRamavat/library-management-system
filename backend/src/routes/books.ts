import { Router } from 'express';

import * as booksController from '../controllers/books.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { validateCheckoutOrReturnBody } from '../validators/books.validator';

export const router = Router();

router.get('/', auth, booksController.listBooks);

router.post(
  '/checkout',
  auth,
  validate(validateCheckoutOrReturnBody),
  booksController.checkoutBook,
);

router.post(
  '/return',
  auth,
  validate(validateCheckoutOrReturnBody),
  booksController.returnBook,
);
