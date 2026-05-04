import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';

const DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('NEON_DATABASE_URL environment variable is required');
  process.exit(1);
}

const client = neon(DATABASE_URL);

async function main() {
  console.log('Running database migration...');

  await client`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      date TEXT NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      read_time TEXT NOT NULL,
      featured BOOLEAN DEFAULT FALSE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  console.log('Migration complete. Table "posts" is ready.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
