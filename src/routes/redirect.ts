import type { FastifyInstance } from 'fastify';
import { getDB } from '../config/db.js';

const RESERVED = new Set([
  'app', 'shorten', 'guest', 'auth', 'login', 'signin',
  'register', 'signup', 'admin', 'api', 'assets', 'animations', 'go'
]);

export async function redirectRoutes(fastify: FastifyInstance) {
  const handleRedirect = async (request: any, reply: any) => {
    let code = (request.params.code || request.params['*'] || '').replace(/^\/+/, '');
    if (!code || RESERVED.has(code.toLowerCase())) {
      return reply.sendFile('index.html');
    }

    const db = getDB();
    const res = await db.query('SELECT url FROM links WHERE code = $1', [code]);
    if (res.rows.length === 0) {
      return reply.status(404).send({ error: 'Link not found' });
    }

    const url = res.rows[0].url;
    return reply.redirect(`/go?url=${encodeURIComponent(url)}`, 302);
  };

  fastify.get('/r/:code', handleRedirect);
  fastify.get('/r/*', handleRedirect);
  fastify.get('/:code([0-9a-zA-Z]{6,8})', handleRedirect);
}

