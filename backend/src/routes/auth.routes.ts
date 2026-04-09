import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import AuthService from '../services/auth.service.js';

export default async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const authService = new AuthService(fastify.pg, fastify.jwt);

  fastify.post('/signup', async (request: any, reply) => {
    const { email, password, fullName } = request.body;
    const result = await authService.signup(email, password, fullName);
    return reply.send(result);
  });

  fastify.post('/login', async (request: any, reply) => {
    const { email, password } = request.body;
    const result = await authService.login(email, password);
    return reply.send(result);
  });

  fastify.post('/refresh', async (request: any, reply) => {
    const { refreshToken } = request.body;
    const result = await authService.refresh(refreshToken);
    return reply.send(result);
  });
}
