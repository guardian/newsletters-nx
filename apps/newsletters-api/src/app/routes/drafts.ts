import { Express } from 'express';
import { permissionService } from '../../services/permissions';
import { draftStore } from '../../services/storage';
import { getUserProfile } from '../get-user-profile';
import {
	makeErrorResponse,
	makeSuccessResponse,
	mapStorageFailureReasonToStatusCode,
} from '../responses';

export function registerDraftsRoutes(app: Express) {
	app.get('/api/drafts', async (req, res) => {
		const storageResponse = await draftStore.readAll();
		if (storageResponse.ok) {
			return res.send(makeSuccessResponse(storageResponse.data));
		}
		return res
			.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
			.send(makeErrorResponse(storageResponse.message));
	});

	app.get(
		'/api/drafts/:listId',
		async (req, res) => {
			const { listId } = req.params;
			const idAsNumber = Number(listId);
			if (isNaN(idAsNumber)) {
				return res.status(400).send(makeErrorResponse('Non numerical id passed'));
			}

			const storageResponse = await draftStore.read(idAsNumber);
			if (storageResponse.ok) {
				return res.send(makeSuccessResponse(storageResponse.data));
			}
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		},
	);

	app.delete(
		'/api/drafts/:listId',
		async (req, res) => {
			const user = getUserProfile(req);
			const permissions = await permissionService.get(user.profile);

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
				return res.send(makeSuccessResponse(storageResponse.data));
			}

			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		},
	);
}
