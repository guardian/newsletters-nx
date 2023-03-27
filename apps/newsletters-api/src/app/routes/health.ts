import type { FastifyInstance } from 'fastify';

export function registerHealthRoute(app: FastifyInstance) {
	/** Health check endpoint */
	app.get('/healthcheck', (req, res) => {
		console.log('====> Health check endpoint called');
		return res.send({ message: 'Newsletters API running' });
	});
}
