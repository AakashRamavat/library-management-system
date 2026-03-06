import dotenv from 'dotenv';

import { createApp } from './app';
import { initDb, sequelize } from './db/client';
import './db/models';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  try {
    await initDb();
    await sequelize.sync();

    const app = createApp();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

void start();

