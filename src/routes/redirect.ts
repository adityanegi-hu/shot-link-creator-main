import type { FastifyInstance } from 'fastify';

const RESERVED = new Set([
  'app', 'shorten', 'guest', 'auth', 'login', 'signin',
  'register', 'signup', 'admin', 'api', 'assets', 'animations', 'go'
]);

export async function redirectRoutes(fastify: FastifyInstance) {
  // Direct redirect page
  fastify.get('/go', (_request, reply) => reply.sendFile('go.html'));
  fastify.get('/go/*', (_request, reply) => reply.sendFile('go.html'));

  // Any short link at /r/* serves go.html where client-side decoding & analytics happen
  fastify.get('/r/:code', (_request, reply) => reply.sendFile('go.html'));
  fastify.get('/r/*', (_request, reply) => reply.sendFile('go.html'));

  // Root short links like /:code (excluding reserved SPA routes)
  fastify.get('/:code([0-9a-zA-Z_-]{4,})', (request: any, reply: any) => {
    const code = request.params.code?.toLowerCase();
    if (RESERVED.has(code)) {
      return reply.sendFile('index.html');
    }
    return reply.sendFile('go.html');
  });
}
