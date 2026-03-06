import { Router } from 'express';

import * as transactionsController from '../controllers/transactions.controller';
import { auth } from '../middleware/auth';

export const router = Router();

router.get('/', auth, transactionsController.listTransactions);
