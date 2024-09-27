import type { FastifyInstance } from 'fastify';
import {
	editionIdSchema,
	layoutSchema,
} from '@newsletters-nx/newsletters-data-client';
import { permissionService } from '../../services/permissions';
import { layoutStore } from '../../services/storage';
import { getUserProfile } from '../get-user-profile';
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

export function registerWriteLayoutRoutes(app: FastifyInstance) {
	app.post<{
		Body: unknown;
		Params: { editionId: string };
	}>('/api/layouts/:editionId', async (req, res) => {
		const { editionId } = req.params;
		const layout: unknown = req.body;
		const user = getUserProfile(req);
		const permissions = await permissionService.get(user.profile);

		if (!permissions.editLayouts) {
			return res
				.status(403)
				.send(makeErrorResponse(`You don't have permission to edit layouts.`));
		}

		const idParseResult = editionIdSchema.safeParse(editionId.toUpperCase());
		if (!idParseResult.success) {
			return res
				.status(400)
				.send(makeErrorResponse(`No such edition ${editionId}`));
		}

		const layoutParseResult = layoutSchema.safeParse(layout);
		if (!layoutParseResult.success) {
			return res.status(400).send(makeErrorResponse(`invalid layout data`));
		}

		const storageResponse = await layoutStore.create(
			idParseResult.data,
			layoutParseResult.data,
		);

		if (!storageResponse.ok) {
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		}
		return makeSuccessResponse(storageResponse.data);
	});
}
