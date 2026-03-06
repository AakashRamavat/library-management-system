import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory (npm test is run from backend)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Fallback for CI or when .env is missing (use a local test DB URL)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://library_user:library_password@localhost:5432/library_db?schema=public';
}
if (!process.env.JWT_ACCESS_SECRET) {
  process.env.JWT_ACCESS_SECRET = 'test-access-secret';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
}
