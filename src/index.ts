import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

if (typeof (process as any).loadEnvFile === 'function') {
  try {
    (process as any).loadEnvFile();
  } catch {}
}

import { connectDB } from './config/db.js';
import { analyticsRoutes } from './routes/analytics.js';
import { redirectRoutes } from './routes/redirect.js';
import { safetyRoutes } from './routes/safety.js';
import { authRoutes } from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

async function bootstrap() {
  try {
    await connectDB();

    await fastify.register(fastifyStatic, {
      root: path.join(__dirname, '..', 'public'),
      prefix: '/',
      setHeaders(reply, filePath) {
        reply.header('Access-Control-Allow-Origin', '*');
        if (/\.(?:js|css|html)$/i.test(filePath)) {
          reply.header('Cache-Control', 'no-cache, must-revalidate');
        }
      },
    });

    await analyticsRoutes(fastify);
    await redirectRoutes(fastify);
    await safetyRoutes(fastify);
    await authRoutes(fastify);

    // SPA fallback — never serve HTML for missing JS/CSS (that blanks the app)
    fastify.setNotFoundHandler((request, reply) => {
      const url = request.raw.url || '';
      if (url.startsWith('/api') || url.startsWith('/assets') || /\.(js|css|map|json|ico|png|svg)$/i.test(url)) {
        return reply.code(404).send({ error: 'Not found' });
      }
      return reply.sendFile('index.html');
    });

    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap();
