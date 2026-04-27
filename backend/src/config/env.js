import dotenv from 'dotenv';
import { ensureDatabaseUrl } from './ensureDatabaseUrl.js';

dotenv.config();
ensureDatabaseUrl();

const required = ['JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is not set. Set it in .env for production.`);
  }
}

if (!process.env.DATABASE_URL) {
  console.warn(
    'Warning: DATABASE_URL is not set. Set DATABASE_URL or DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT in .env'
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me-in-production-min-32-chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
