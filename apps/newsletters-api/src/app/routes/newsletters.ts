import type { FastifyInstance } from 'fastify';
import {
	isPartialNewsletterData,
	transformDataToLegacyNewsletter,
} from '@newsletters-nx/newsletters-data-client';
import { emailService } from '../../services/email';
import { newsletterStore } from '../../services/storage';
import {
	makeErrorResponse,
	makeSuccessResponse,
	mapStorageFailureReasonToStatusCode,
} from '../responses';

export function registerNewsletterRoutes(app: FastifyInstance) {
	// not using the makeSuccess function on this route as
	// we are emulating the response of the legacy API
	app.get('/api/legacy/newsletters', async (req, res) => {
		const storageResponse = await newsletterStore.list();
		if (!storageResponse.ok) {
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		}

		return storageResponse.data.map(transformDataToLegacyNewsletter);
	});

	app.get('/api/newsletters', async (req, res) => {
		const storageResponse = await newsletterStore.list();
		if (!storageResponse.ok) {
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		}

		const report = await emailService.send(
			['bob@burger.com'],
			'newsletter list accessed',
			'Someone made an api call to read the newsletters',
		);
		console.log({ report });
		return makeSuccessResponse(storageResponse.data);
	});

	app.get<{ Params: { newsletterId: string } }>(
		'/api/newsletters/:newsletterId',
		async (req, res) => {
			const { newsletterId } = req.params;
			const storageResponse = await newsletterStore.readByName(newsletterId);

			if (!storageResponse.ok) {
				return res
					.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
					.send(makeErrorResponse(storageResponse.message));
			}

			return makeSuccessResponse(storageResponse.data);
		},
	);

	app.patch<{
		Params: { newsletterId: string };
		Body: unknown;
	}>('/api/newsletters/:newsletterId', async (req, res) => {
		const { newsletterId } = req.params;
		const { body: modifications } = req;
		const newsletterIdAsNumber = Number(newsletterId);

		if (isNaN(newsletterIdAsNumber)) {
			return res.status(400).send(makeErrorResponse(`Non numeric id provided`));
		}

		if (!isPartialNewsletterData(modifications)) {
			return res
				.status(400)
				.send(makeErrorResponse(`Not a valid partial newsletter`));
		}

		const storageResponse = await newsletterStore.update(
			newsletterIdAsNumber,
			modifications,
		);

		if (!storageResponse.ok) {
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		}

		return makeSuccessResponse(storageResponse.data);
	});
}
