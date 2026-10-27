import type { FastifyInstance } from 'fastify';
import { checkUrlSafety } from '../services/safeBrowsing.js';
import { z } from 'zod';

const SafetyQuerySchema = z.object({
  url: z.string().min(1),
});

export async function safetyRoutes(fastify: FastifyInstance) {
  // GET /api/safety/check?url=https://example.com
  fastify.get('/api/safety/check', async (request, reply) => {
    const parseRes = SafetyQuerySchema.safeParse(request.query);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Valid "url" query parameter required' });
    }
    const result = await checkUrlSafety(parseRes.data.url);
    return reply.send(result);
  });

  // POST /api/safety/check  body: { url: "https://example.com" }
  fastify.post('/api/safety/check', async (request, reply) => {
    const parseRes = SafetyQuerySchema.safeParse(request.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Valid "url" in JSON body required' });
    }
    const result = await checkUrlSafety(parseRes.data.url);
    return reply.send(result);
  });
}

