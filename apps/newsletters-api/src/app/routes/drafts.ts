import type { FastifyInstance } from 'fastify';
// import { isLegacyNewsletter } from '@newsletters-nx/newsletters-data-client';
// import newslettersData from '../../../static/newsletters.local.json';
import type {
	ApiResponse,
	DraftStorage,
	DraftWithId,
} from '@newsletters-nx/newsletters-data-client';
import { StorageRequestFailureReason } from '@newsletters-nx/newsletters-data-client';
import { storageInstance } from '../../services/storageInstance';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

// casting as DraftStorage so the methods are typed to
// allow for failed responses.
const draftStore = storageInstance as DraftStorage;

const mapFailureReasonToStatusCode = (
	reason?: StorageRequestFailureReason,
): number => {
	switch (reason) {
		case StorageRequestFailureReason.InvalidDataInput:
			return 400;
		case StorageRequestFailureReason.NotFound:
			return 404;
		case StorageRequestFailureReason.DataInStoreNotValid:
			return 422;
		default:
			return 500;
	}
};

export function registerDraftsRoutes(app: FastifyInstance) {
	app.get('/api/drafts', async (req, res) => {
		const storageResponse = await draftStore.listDrafts();
		if (storageResponse.ok) {
			return makeSuccessResponse(storageResponse.data);
		}
		return res
			.status(mapFailureReasonToStatusCode(storageResponse.reason))
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

			const storageResponse = await draftStore.getDraftNewsletter(idAsNumber);
			if (storageResponse.ok) {
				return makeSuccessResponse(storageResponse.data);
			}
			return res
				.status(mapFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		},
	);

	app.delete<{ Params: { listId: string } }>(
		'/api/drafts/:listId',
		async (req, res): Promise<ApiResponse<DraftWithId>> => {
			const { listId } = req.params;
			const idAsNumber = Number(listId);

			if (isNaN(idAsNumber)) {
				return res
					.status(400)
					.send(makeErrorResponse('Non numerical id passed'));
			}

			const storageResponse = await draftStore.deleteDraftNewsletter(
				idAsNumber,
			);

			if (storageResponse.ok) {
				return makeSuccessResponse(storageResponse.data);
			}

			return res
				.status(mapFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		},
	);
}
