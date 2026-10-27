import { Pool } from 'pg';

let pool: Pool;

export async function connectDB(retries = 10, delay = 2000) {
  if (!pool) {
    pool = new Pool({
      user: process.env.PG_USER || 'postgres',
      host: process.env.PG_HOST || 'localhost',
      database: process.env.PG_DATABASE || 'analytics_db',
      password: process.env.PG_PASSWORD || 'your_password',
      port: Number(process.env.PG_PORT) || 5432,
    });
  }

  for (let i = 0; i < retries; i++) {
    try {
      await pool.query(`
        DROP TABLE IF EXISTS links;

        CREATE TABLE IF NOT EXISTS analytics (
          id           BIGSERIAL PRIMARY KEY,
          original_url TEXT NOT NULL,
          clicked_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          ip_address   INET,
          user_agent   TEXT
        );

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
    pool = new Pool({
      user: process.env.PG_USER || 'postgres',
      host: process.env.PG_HOST || 'localhost',
      database: process.env.PG_DATABASE || 'analytics_db',
      password: process.env.PG_PASSWORD || 'your_password',
      port: Number(process.env.PG_PORT) || 5432,
    });
  }
  return pool;
}
