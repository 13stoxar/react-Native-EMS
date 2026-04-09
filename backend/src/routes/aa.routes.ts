import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import AAService from '../services/aa.service.js';

export default async function aaRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const aaService = new AAService(fastify.pg);

  // Initiate Consent
  fastify.post('/consent/initiate', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply) => {
    const { userId } = request.user;
    const { VUA } = request.body; // Virtual User Address for AA
    
    const result = await aaService.initiateConsent(userId, VUA);
    return reply.send(result);
  });

  // Check Consent Status
  fastify.get('/consent/:consentId/status', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply) => {
    const { consentId } = request.params;
    const result = await aaService.getConsentStatus(consentId);
    return reply.send(result);
  });

  // Fetch Financial Information
  fastify.post('/fi/fetch', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply) => {
    const { consentId } = request.body;
    const result = await aaService.fetchFIData(consentId);
    return reply.send(result);
  });

  // Webhook for AA Notifications
  fastify.post('/webhook', async (request, reply) => {
    const payload = request.body;
    await aaService.handleWebhook(payload);
    return reply.code(200).send({ status: 'received' });
  });

  // Get User Transactions
  fastify.get('/transactions', {
    preHandler: [fastify.authenticate]
  }, async (request: any, reply) => {
    const { userId } = request.user;
    const transactions = await aaService.getUserTransactions(userId);
    return reply.send(transactions);
  });
}
