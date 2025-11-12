import type { Express } from 'express';

export function registerHealthRoute(app: Express) {
	/** Health check endpoint */
	app.get('/healthcheck', (req, res) => {
		return res.send({ message: 'Newsletters API running' });
	});
}
