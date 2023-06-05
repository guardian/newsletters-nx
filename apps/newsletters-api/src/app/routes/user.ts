import type { FastifyInstance } from 'fastify';
import { getLocalUserProfiles } from '../../apiDeploymentSettings';
import { permissionService } from '../../services/permissions';
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
		const permissions = await permissionService.get(maybeUser.profile);
		return res.send(makeSuccessResponse(permissions));
	});

	app.get('/api/user/environment', async (req, res) => {
		const rawVar = process.env.LOCAL_PERMISSIONS;
		const users = getLocalUserProfiles();
		return res.send(makeSuccessResponse({ rawVar, users }));
	});
}
