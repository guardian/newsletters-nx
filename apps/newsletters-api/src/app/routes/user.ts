import type { FastifyInstance } from 'fastify';
import {
	buildS3,
	getPinboardPermissionOverrides,
	userHasPinboardPermission,
} from '../../services/permission-data';
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

	app.get('/api/user/permission-data', async (req, res) => {
		const s3 = buildS3();
		const data = await getPinboardPermissionOverrides(s3);
		return res.send({ permissions: data });
	});

	app.get('/api/user/can-i-pinboard', async (req, res) => {
		const maybeUser = getUserProfile(req);
		if (!maybeUser.profile) {
			return res.status(500).send(makeErrorResponse(maybeUser.errorMessage));
		}

		const { email } = maybeUser.profile;

		if (!email) {
			return res.status(500).send(makeErrorResponse('NO EMAIL'));
		}

		try {
			const canUsePinBoard = await userHasPinboardPermission(email);
			return res.send(makeSuccessResponse({ email, canUsePinBoard }));
		} catch (e) {
			console.log(e);
			return res
				.status(500)
				.send(makeErrorResponse('Failed to read pinboard permissions'));
		}
	});
}
