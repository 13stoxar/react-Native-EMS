import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyPostgres from '@fastify/postgres';
import * as dotenv from 'dotenv';
import aaRoutes from './routes/aa.routes.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty'
    }
  }
});

// Plugins
server.register(fastifyPostgres, {
  connectionString: process.env.DATABASE_URL
});

server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'supersecretkey'
});

// Decorators
server.decorate("authenticate", async function(request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(aaRoutes, { prefix: '/api/aa' });

// Health Check
server.get('/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server started on port 3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
