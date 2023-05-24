import type { FastifyInstance } from 'fastify';
import { getUserProfile } from '../get-user-profile';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

export function registerUserRoute(app: FastifyInstance) {
	app.get('/api/user/whoami', async (req, res) => {
		const maybeUser = getUserProfile(req);

		if (!maybeUser.ok) {
			return res.status(500).send(makeErrorResponse(maybeUser.errorMessage));
		}

		return res.send(makeSuccessResponse(maybeUser.profile));
	});
}
