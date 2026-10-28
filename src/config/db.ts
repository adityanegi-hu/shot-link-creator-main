import { Pool } from 'pg';

let pool: Pool;

function createPool(): Pool {
  if (process.env.DATABASE_URL) {
    const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
    });
  }
  return new Pool({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'analytics_db',
    password: process.env.PG_PASSWORD || 'your_password',
    port: Number(process.env.PG_PORT) || 5432,
  });
}

export async function connectDB(retries = 10, delay = 2000) {
  if (!pool) {
    pool = createPool();
  }

  for (let i = 0; i < retries; i++) {
    try {
      await pool.query(`
        DROP TABLE IF EXISTS links;

        CREATE TABLE IF NOT EXISTS analytics (
          id           BIGSERIAL PRIMARY KEY,
          code         TEXT,
          original_url TEXT,
          clicked_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          ip_address   INET,
          user_agent   TEXT
        );

        ALTER TABLE analytics ADD COLUMN IF NOT EXISTS code TEXT;
        ALTER TABLE analytics ALTER COLUMN original_url DROP NOT NULL;
        UPDATE analytics SET original_url = NULL WHERE original_url IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_analytics_code ON analytics(code);
        CREATE INDEX IF NOT EXISTS idx_analytics_clicked_at ON analytics(clicked_at);
      `);
      console.log('PostgreSQL connected — analytics ready');
      return;
    } catch (err: any) {
      if (i === retries - 1) throw err;
      console.log(`Waiting for PostgreSQL (${err.message})... retry ${i + 1}/${retries}`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

export function getDB() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}
