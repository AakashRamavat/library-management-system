import { Router } from 'express';

import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import {
  validateLoginBody,
  validateRefreshBody,
  validateSignUpBody,
} from '../validators/auth.validator';

export const router = Router();

router.post('/signup', validate(validateSignUpBody), authController.signUp);

router.post('/login', validate(validateLoginBody), authController.login);

router.post('/refresh', validate(validateRefreshBody), authController.refresh);
