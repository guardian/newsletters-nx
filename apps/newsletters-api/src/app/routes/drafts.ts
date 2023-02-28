import type { FastifyInstance } from 'fastify';
// import { isNewsletter } from '@newsletters-nx/newsletters-data-client';
// import newslettersData from '../../../static/newsletters.local.json';
import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { storageInstance } from '../../services/storageInstance';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

// casting as DraftStorage so the methods are typed to
// allow for failed responses.
const drafStore = storageInstance as DraftStorage;

export function registerDraftsRoutes(app: FastifyInstance) {
	app.get('/api/v1/drafts', async (req, res) => {
		const storageResponse = await drafStore.listDrafts();
		if (storageResponse.ok) {
			return makeSuccessResponse(storageResponse.data);
		}
		return makeErrorResponse(storageResponse.message);
	});

	app.get<{ Params: { listId: string } }>(
		'/api/v1/drafts/:listId',
		async (req, res) => {
			const { listId } = req.params;
			const idAsNumber = Number(listId);
			if (isNaN(idAsNumber)) {
				return makeErrorResponse('Non numerical id passed');
			}

			const storageResponse = await drafStore.getDraftNewsletter(idAsNumber);
			if (storageResponse.ok) {
				return makeSuccessResponse(storageResponse.data);
			}
			return makeErrorResponse(storageResponse.message);
		},
	);
}
