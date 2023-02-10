import type { FastifyInstance } from 'fastify';

export function registerHealthRoute(app: FastifyInstance) {
	/** Health check endpoint */
	app.get('/healthcheck', () => {
		console.log('====> Health check endpoint called');
		return {
			message: 'Newsletters API running',
		};
	});
}
