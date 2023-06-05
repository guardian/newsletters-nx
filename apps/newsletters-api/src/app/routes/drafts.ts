import type { FastifyInstance } from 'fastify';
import type {
	ApiResponse,
	DraftWithId,
} from '@newsletters-nx/newsletters-data-client';
import { draftStore } from '../../services/storage';
import { getPermissions } from '../get-user-permissions';
import { getUserProfile } from '../get-user-profile';
import {
	makeErrorResponse,
	makeSuccessResponse,
	mapStorageFailureReasonToStatusCode,
} from '../responses';

export function registerDraftsRoutes(app: FastifyInstance) {
	app.get('/api/drafts', async (req, res) => {
		const storageResponse = await draftStore.readAll();
		if (storageResponse.ok) {
			return makeSuccessResponse(storageResponse.data);
		}
		return res
			.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
			.send(makeErrorResponse(storageResponse.message));
	});

	app.get<{ Params: { listId: string } }>(
		'/api/drafts/:listId',
		async (req, res) => {
			const { listId } = req.params;
			const idAsNumber = Number(listId);
			if (isNaN(idAsNumber)) {
				return makeErrorResponse('Non numerical id passed');
			}

			const storageResponse = await draftStore.read(idAsNumber);
			if (storageResponse.ok) {
				return makeSuccessResponse(storageResponse.data);
			}
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		},
	);

	app.delete<{ Params: { listId: string } }>(
		'/api/drafts/:listId',
		async (req, res): Promise<ApiResponse<DraftWithId>> => {
			const user = getUserProfile(req);
			const permissions = await getPermissions(user.profile);

			if (!permissions.writeToDrafts) {
				return res
					.status(403)
					.send(
						makeErrorResponse(`You don't have permission to delete drafts.`),
					);
			}

			const { listId } = req.params;
			const idAsNumber = Number(listId);

			if (isNaN(idAsNumber)) {
				return res
					.status(400)
					.send(makeErrorResponse('Non numerical id passed'));
			}

			const storageResponse = await draftStore.deleteItem(idAsNumber);

			if (storageResponse.ok) {
				return makeSuccessResponse(storageResponse.data);
			}

			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		},
	);
}
