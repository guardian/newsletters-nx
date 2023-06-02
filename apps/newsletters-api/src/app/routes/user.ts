import type { FastifyInstance } from 'fastify';
import { getPermissions } from '@newsletters-nx/newsletters-data-client';
import { getUserProfile } from '../get-user-profile';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

export function registerUserRoute(app: FastifyInstance) {
	app.get('/api/user/whoami', async (req, res) => {
		const maybeUser = getUserProfile(req);
		if (!maybeUser.profile) {
			return res.status(500).send(makeErrorResponse(maybeUser.errorMessage));
		}
		return res.send(makeSuccessResponse(maybeUser.profile));
	});

	app.get('/api/user/permissions', async (req, res) => {
		const maybeUser = getUserProfile(req);
		const permissions = await getPermissions(maybeUser.profile);
		return res.send(makeSuccessResponse(permissions));
	});
}
