import type { FastifyInstance } from 'fastify';

const fakeCookie = process.env.FAKE_COOKIE;

export function registerUserRoute(app: FastifyInstance) {
	app.get('/api/user/whoami', (req, res) => {
		return res.send({ message: 'IDK', fakeCookie });
	});
}
