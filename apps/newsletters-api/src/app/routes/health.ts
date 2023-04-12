import type { FastifyInstance } from 'fastify';

export function registerHealthRoute(app: FastifyInstance) {
	/** Health check endpoint */
	app.get('/healthcheck', (req, res) => {
		return res.send({ message: 'Newsletters API running' });
	});
}
