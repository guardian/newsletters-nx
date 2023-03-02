import type { FastifyInstance } from 'fastify';
// import { isNewsletter } from '@newsletters-nx/newsletters-data-client';
// import newslettersData from '../../../static/newsletters.local.json';
import type {
	ApiResponse,
	DraftStorage,
	DraftWithId,
} from '@newsletters-nx/newsletters-data-client';
import { storageInstance } from '../../services/storageInstance';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

// casting as DraftStorage so the methods are typed to
// allow for failed responses.
const draftStore = storageInstance as DraftStorage;

export function registerDraftsRoutes(app: FastifyInstance) {
	app.get('/v1/drafts', async (req, res) => {
		const storageResponse = await draftStore.listDrafts();
		if (storageResponse.ok) {
			return makeSuccessResponse(storageResponse.data);
		}
		return makeErrorResponse(storageResponse.message);
	});

	app.get<{ Params: { listId: string } }>(
		'/v1/drafts/:listId',
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
			return makeErrorResponse(storageResponse.message);
		},
	);

	app.delete<{ Params: { listId: string } }>(
		'/v1/drafts/:listId',
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

			return makeErrorResponse(
				storageResponse.message,
			) as ApiResponse<DraftWithId>;
		},
	);
}
