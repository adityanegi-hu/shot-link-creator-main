import type { FastifyInstance } from 'fastify';
import { getDB } from '../config/db.js';
import { z } from 'zod';
import net from 'net';

// Fast in-memory sync for frontend-created short links
const codeStore = new Map<string, { url: string; limit?: number | null }>();

const TrackSchema = z.object({
  code: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  limit: z.union([z.number(), z.string()]).optional().nullable(),
  timestamp: z.any().optional(),
}).passthrough();

export async function analyticsRoutes(fastify: FastifyInstance) {
  // Sync a short code with its destination URL (called on link creation)
  fastify.post('/api/analytics/sync', async (request, reply) => {
    const { code, url, limit } = (request.body || {}) as {
      code?: string;
      url?: string;
      limit?: number | null;
    };
    if (code && url) {
      codeStore.set(code.trim().toLowerCase(), { url, limit: limit || null });
      codeStore.set(code.trim(), { url, limit: limit || null });
    }
    return reply.status(200).send({ ok: true });
  });

  // Resolve a short code destination (for cross-device / fresh browser visits)
  fastify.get('/api/analytics/resolve', async (request, reply) => {
    const { code } = request.query as { code?: string };
    if (!code) {
      return reply.status(400).send({ error: 'Code required' });
    }
    const cleanCode = code.trim();
    // 1. In-memory check
    const mem = codeStore.get(cleanCode) || codeStore.get(cleanCode.toLowerCase());
    if (mem) {
      return { url: mem.url, limit: mem.limit };
    }
    // 2. Query Postgres analytics for any recorded events with this code
    try {
      const db = getDB();
      const res = await db.query(
        'SELECT original_url FROM analytics WHERE code = $1 OR lower(code) = lower($1) LIMIT 1',
        [cleanCode]
      );
      if (res.rows.length > 0 && res.rows[0].original_url) {
        return { url: res.rows[0].original_url, limit: null };
      }
    } catch (e) {}

    return reply.status(404).send({ error: 'Link not found' });
  });

  // Check limit without recording
  fastify.get('/api/analytics/check', async (request) => {
    const { code, url, limit: rawLimit } = request.query as {
      code?: string;
      url?: string;
      limit?: string;
    };
    const limit = rawLimit ? parseInt(rawLimit, 10) : null;
    const db = getDB();

    let count = 0;
    if (code) {
      const res = await db.query('SELECT COUNT(*) as count FROM analytics WHERE code = $1', [code]);
      count = Number(res.rows[0]?.count || 0);
    } else if (url) {
      const res = await db.query('SELECT COUNT(*) as count FROM analytics WHERE original_url = $1', [url]);
      count = Number(res.rows[0]?.count || 0);
    }

    const limitReached = limit !== null && !isNaN(limit) && count >= limit;
    return {
      count,
      limit,
      allowed: !limitReached,
      limitReached,
    };
  });

  // Record a click & enforce limit (Privacy: original_url is NEVER saved to Postgres)
  fastify.post('/api/analytics', async (request, reply) => {
    const body = TrackSchema.parse(request.body);
    const db = getDB();
    const rawIp = (request.headers['x-forwarded-for']?.toString().split(',')[0].trim()
               ?? request.ip ?? '').replace(/^::ffff:/, '');
    const ip = net.isIP(rawIp) ? rawIp : null;
    const code = body.code ? body.code.trim() : null;
    const limit = body.limit ? parseInt(String(body.limit), 10) : null;

    // Check existing clicks by short code
    let currentCount = 0;
    if (code) {
      const countRes = await db.query('SELECT COUNT(*) as count FROM analytics WHERE code = $1', [code]);
      currentCount = Number(countRes.rows[0]?.count || 0);
    }

    // Enforce limit if specified
    if (limit !== null && !isNaN(limit) && currentCount >= limit) {
      return reply.status(200).send({
        allowed: false,
        limitReached: true,
        count: currentCount,
        limit,
        message: `This link has reached its maximum visit limit of ${limit} clicks.`,
      });
    }

    // Insert new click - pure telemetry, zero destination URL saved
    await db.query(
      'INSERT INTO analytics (code, ip_address, user_agent) VALUES ($1, $2, $3)',
      [code, ip, request.headers['user-agent'] || null]
    );

    return reply.status(200).send({
      allowed: true,
      limitReached: false,
      count: currentCount + 1,
      limit,
    });
  });

  // Get stats for a code (No destination URLs exposed)
  fastify.get('/api/analytics', async (request) => {
    const { code } = request.query as { code?: string };
    const db = getDB();

    if (code) {
      const res = await db.query(
        'SELECT COUNT(*) as total, MIN(clicked_at) as first_click, MAX(clicked_at) as last_click FROM analytics WHERE code = $1',
        [code]
      );
      return res.rows[0];
    }

    // Overall stats (latest 100 clicks: ID, code, timestamp, IP)
    const res = await db.query(
      'SELECT id, code, clicked_at, ip_address FROM analytics ORDER BY clicked_at DESC LIMIT 100'
    );
    return { clicks: res.rows };
  });
}
