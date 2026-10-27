import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { connectDB } from './config/db.js';
import { shortenRoutes } from './routes/shorten.js';
import { analyticsRoutes } from './routes/analytics.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

async function bootstrap() {
  try {
    await connectDB();

    await fastify.register(fastifyStatic, {
      root: path.join(__dirname, '..', 'public'),
      prefix: '/',
    });

    // Serve go.html for the /go path
    fastify.get('/go', (_request, reply) => {
      reply.sendFile('go.html');
    });

    await shortenRoutes(fastify);
    await analyticsRoutes(fastify);

    // SPA fallback
    fastify.setNotFoundHandler((_request, reply) => {
      reply.sendFile('index.html');
    });

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Server running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap();
