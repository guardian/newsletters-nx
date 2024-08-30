import type { FastifyInstance } from 'fastify';
import { editionIdSchema } from '@newsletters-nx/newsletters-data-client';
import { layoutStore } from '../../services/storage';
import {
	makeErrorResponse,
	makeSuccessResponse,
	mapStorageFailureReasonToStatusCode,
} from '../responses';

export function registerReadLayoutRoutes(app: FastifyInstance) {
	app.get('/api/layouts', async (req, res) => {
		const storageResponse = await layoutStore.readAll();
		if (!storageResponse.ok) {
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		}
		return makeSuccessResponse(storageResponse.data);
	});

	app.get<{
		Params: { editionId: string };
	}>('/api/layouts/:editionId', async (req, res) => {
		const { editionId } = req.params;

		const idParseResult = editionIdSchema.safeParse(editionId.toUpperCase());

		if (!idParseResult.success) {
			return res
				.status(400)
				.send(makeErrorResponse(`No such edition ${editionId}`));
		}

		const storageResponse = await layoutStore.read(idParseResult.data);

		if (!storageResponse.ok) {
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		}
		return makeSuccessResponse(storageResponse.data);
	});
}
