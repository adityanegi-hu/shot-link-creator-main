import { Pool } from 'pg';

let pool: Pool;

export async function connectDB() {
  if (!pool) {
    pool = new Pool({
      user: process.env.PG_USER || 'postgres',
      host: process.env.PG_HOST || 'localhost',
      database: process.env.PG_DATABASE || 'analytics_db',
      password: process.env.PG_PASSWORD || 'your_password',
      port: Number(process.env.PG_PORT) || 5432,
    });
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      code VARCHAR(8) PRIMARY KEY,
      url  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id           BIGSERIAL PRIMARY KEY,
      original_url TEXT NOT NULL,
      clicked_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      ip_address   INET,
      user_agent   TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_clicked_at ON analytics(clicked_at);
  `);
  console.log('PostgreSQL connected — tables ready');
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
