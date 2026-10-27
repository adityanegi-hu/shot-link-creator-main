import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const ShortenSchema = z.object({
  url: z.string().url(),
});

export async function shortenRoutes(fastify: FastifyInstance) {
  fastify.post('/api/shorten', async (request, reply) => {
    const { url } = ShortenSchema.parse(request.body);
    const baseUrl = process.env.BASE_URL || `http://localhost:3000`;
    // The actual encoding happens client-side; we just return the base redirect URL
    // Frontend will append #<lz-encoded-url> to make the full shareable link
    return { url, redirectBase: `${baseUrl}/go` };
  });
}
