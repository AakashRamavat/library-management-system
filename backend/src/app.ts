import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from './middleware/error-handler';
import { router as authRouter } from './routes/auth';
import { router as booksRouter } from './routes/books';
import { router as transactionsRouter } from './routes/transactions';
import { successResponse } from './utils/response';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    successResponse(res, { status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/books', booksRouter);
  app.use('/api/transactions', transactionsRouter);

  app.use(errorHandler);

  return app;
}

