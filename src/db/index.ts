import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function getDb() {
  const url = import.meta.env.NEON_DATABASE_URL;
  if (!url) {
    return null;
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export const db = getDb();

export function requireDb() {
  if (!db) {
    throw new Error('NEON_DATABASE_URL not configured. Database unavailable.');
  }
  return db;
}
