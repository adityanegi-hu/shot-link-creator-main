import type { FastifyInstance } from 'fastify';
import { getDB } from '../config/db.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CODE_LEN = 6;

function randomCode(): string {
  const bytes = new Uint8Array(CODE_LEN);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => ALPHABET[b % 62]).join('');
}

function buildResponse(code: string, url: string, base: string) {
  return {
    id: randomUUID(),      // SPA may check for id presence
    code,
    shortCode: code,
    short_code: code,
    shortUrl: `${base}/r/${code}`,
    url,
    original_url: url,
    originalUrl: url,
    status: 'active',      // SPA may check status === 'active'
    qrCode: '',
  };
}

const ShortenSchema = z.object({
  url: z.string().url().optional(),
  original_url: z.string().url().optional(),
  originalUrl: z.string().url().optional(),
});

export async function shortenRoutes(fastify: FastifyInstance) {
  const handleShorten = async (request: any, reply: any) => {
    const body = ShortenSchema.parse(request.body || {});
    const targetUrl = body.url || body.original_url || body.originalUrl;
    if (!targetUrl) {
      return reply.status(400).send({ error: 'Valid URL is required' });
    }

    const db = getDB();
    const base = process.env.BASE_URL || 'http://localhost:3000';

    // Dedup: return existing code if URL was already shortened
    const existing = await db.query('SELECT code FROM links WHERE url = $1 LIMIT 1', [targetUrl]);
    if (existing.rows.length > 0) {
      return buildResponse(existing.rows[0].code, targetUrl, base);
    }

    // Generate unique 6-char code with collision retry
    let code = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = randomCode();
      const clash = await db.query('SELECT 1 FROM links WHERE code = $1', [candidate]);
      if (clash.rows.length === 0) { code = candidate; break; }
    }
    if (!code) return reply.status(500).send({ error: 'Could not generate unique code' });

    await db.query('INSERT INTO links (code, url) VALUES ($1, $2)', [code, targetUrl]);

    return buildResponse(code, targetUrl, base);
  };

  fastify.post('/api/shorten', handleShorten);
  fastify.post('/shorten', handleShorten);
  fastify.post('/links', handleShorten);
}
