import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

const poolMax = Number(process.env.DB_POOL_MAX ?? '20');
const poolMin = Number(process.env.DB_POOL_MIN ?? '5');

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: poolMax,
    min: poolMin,
    acquire: 30_000,
    idle: 10_000,
  },
});

export async function initDb(): Promise<void> {
  await sequelize.authenticate();
}

