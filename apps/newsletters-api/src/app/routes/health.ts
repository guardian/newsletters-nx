import type { FastifyInstance } from 'fastify';
import { newslettersDataClient } from '@newsletters-nx/newsletters-data-client';

export function registerHealthRoute(app: FastifyInstance) {
	app.get('/health', async () => {
		return Promise.resolve({
			message: 'Hello API',
			stringFromLib: newslettersDataClient(),
		});
	});
}
