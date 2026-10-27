import type { FastifyInstance } from 'fastify';
import { getDB } from '../config/db.js';
import { z } from 'zod';

const TrackSchema = z.object({
  url: z.string().url(),
});

export async function analyticsRoutes(fastify: FastifyInstance) {
  // Record a click
  fastify.post('/api/analytics', async (request, reply) => {
    const body = TrackSchema.parse(request.body);
    const db = getDB();
    const ip = request.headers['x-forwarded-for']?.toString().split(',')[0].trim()
               ?? request.ip;

    await db.query(
      'INSERT INTO analytics (original_url, ip_address, user_agent) VALUES ($1, $2::inet, $3)',
      [body.url, ip || null, request.headers['user-agent'] || null]
    );

    return reply.status(204).send();
  });

  // Get stats for a URL
  fastify.get('/api/analytics', async (request) => {
    const { url } = request.query as { url?: string };
    const db = getDB();

    if (url) {
      const res = await db.query(
        'SELECT COUNT(*) as total, MIN(clicked_at) as first_click, MAX(clicked_at) as last_click FROM analytics WHERE original_url = $1',
        [url]
      );
      return res.rows[0];
    }

    // Overall stats (latest 100 clicks)
    const res = await db.query(
      'SELECT original_url, clicked_at, ip_address FROM analytics ORDER BY clicked_at DESC LIMIT 100'
    );
    return { clicks: res.rows };
  });
}
