import type { FastifyInstance } from 'fastify';
import { transformDataToLegacyNewsletter } from '@newsletters-nx/newsletters-data-client';
import { newsletterStore } from '../../services/storage';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

export function registerNewsletterRoutes(app: FastifyInstance) {
	// not using the makeSuccess function on this route as
	// we are emulating the response of the legacy API
	app.get('/api/legacy/newsletters', async (req, res) => {
		const storageResponse = await newsletterStore.list();
		if (!storageResponse.ok) {
			return res.status(500).send(makeErrorResponse(storageResponse.message));
		}

		return storageResponse.data.map(transformDataToLegacyNewsletter);
	});

	app.get('/api/newsletters', async (req, res) => {
		const storageResponse = await newsletterStore.list();
		if (!storageResponse.ok) {
			return res.status(500).send(makeErrorResponse(storageResponse.message));
		}

		return makeSuccessResponse(storageResponse.data);
	});

	app.get<{ Params: { newsletterId: string } }>(
		'/api/newsletters/:newsletterId',
		async (req, res) => {
			const { newsletterId } = req.params;

			// TO DO - newsletterStore.readByName
			const storageResponse = await newsletterStore.list();
			if (!storageResponse.ok) {
				return res.status(500).send(makeErrorResponse(storageResponse.message));
			}

			const newsletter = storageResponse.data.find(
				(newsletter) => newsletter.identityName === newsletterId,
			);

			if (!newsletter) {
				return res
					.status(404)
					.send(makeErrorResponse(`no match for id ${newsletterId}`));
			}

			return makeSuccessResponse(newsletter);
		},
	);
}
