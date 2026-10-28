import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().optional().nullable(),
  password: z.string().min(1, 'Password is required'),
});

export async function authRoutes(fastify: FastifyInstance) {
  // POST /api/auth/login
  fastify.post('/api/auth/login', async (request, reply) => {
    const parseRes = LoginSchema.safeParse(request.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Password is required' });
    }

    const { email, password } = parseRes.data;
    const adminPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@linko.io').trim();

    // Verify against ADMIN_PASSWORD
    if (password.trim() !== adminPassword) {
      return reply.status(401).send({
        error: 'Invalid admin credentials. Please check your password.',
      });
    }

    const user = {
      id: 'usr_admin_master',
      name: 'System Administrator',
      email: (email && email.trim()) || adminEmail,
      role: 'admin',
    };

    return reply.status(200).send({
      ok: true,
      user,
      token: 'admin_tok_' + Buffer.from(`${user.email}:${Date.now()}`).toString('base64'),
    });
  });

  // POST /api/auth/logout
  fastify.post('/api/auth/logout', async (_req, reply) => {
    return reply.status(200).send({ ok: true });
  });

  // GET /api/auth/me
  fastify.get('/api/auth/me', async (_req, reply) => {
    return reply.status(200).send({
      adminEmail: process.env.ADMIN_EMAIL || 'admin@linko.io',
      isConfigured: !!process.env.ADMIN_PASSWORD,
    });
  });
}

