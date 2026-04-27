/**
 * If DATABASE_URL is not set, build it from DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT
 * (same pattern as many Node + Postgres apps). Sets process.env.DATABASE_URL for Prisma.
 */
export function ensureDatabaseUrl() {
  const existing = process.env.DATABASE_URL?.trim();
  if (existing) return;

  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD ?? '';
  const database = process.env.DB_NAME;
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';

  if (!user || !database) return;

  process.env.DATABASE_URL = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}?schema=public`;
}
