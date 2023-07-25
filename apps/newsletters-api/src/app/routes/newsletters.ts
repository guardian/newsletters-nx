import type { FastifyInstance } from 'fastify';
import {
	isNewsletterData,
	isPartialNewsletterData,
	replaceNullWithUndefinedForUnknown,
	transformDataToLegacyNewsletter,
} from '@newsletters-nx/newsletters-data-client';
import { isServingReadWriteEndpoints } from "../../apiDeploymentSettings";
import { signImages } from '../../services/image/image-signer';
import { newsletterStore } from '../../services/storage';
import { getUserProfile } from '../get-user-profile';
import {
	makeAccessDeniedApiResponse,
	makeErrorResponse,
	makeSuccessResponse,
	mapStorageFailureReasonToStatusCode,
} from '../responses';

export function registerReadNewsletterRoutes(app: FastifyInstance) {
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
		if (!isServingReadWriteEndpoints()) {
			const newsletterDataWithSignedImages = await Promise.all(
				storageResponse.data.map(signImages),
			);
			return makeSuccessResponse(newsletterDataWithSignedImages);
		}
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

			if (!isServingReadWriteEndpoints()) {
				const newsletterDataWithSignedImages = await signImages(
					storageResponse.data,
				);
				return makeSuccessResponse(newsletterDataWithSignedImages);
			}
			return makeSuccessResponse(storageResponse.data);
		},
	);
}

export function registerReadWriteNewsletterRoutes(app: FastifyInstance) {
	app.patch<{
		Params: { newsletterId: string };
		Body: unknown;
	}>('/api/newsletters/:newsletterId', async (req, res) => {
		const user = getUserProfile(req);
		const accessDeniedError = await makeAccessDeniedApiResponse(
			user.profile,
			'editNewsletters',
		);
		if (accessDeniedError) {
			return res.status(403).send(accessDeniedError);
		}

		const { newsletterId } = req.params;
		const { body: modifications } = req;
		const newsletterIdAsNumber = Number(newsletterId);

		if (isNaN(newsletterIdAsNumber)) {
			return res.status(400).send(makeErrorResponse(`Non numeric id provided`));
		}

		replaceNullWithUndefinedForUnknown(modifications);

		if (!isPartialNewsletterData(modifications)) {
			return res
				.status(400)
				.send(makeErrorResponse(`Not a valid partial newsletter`));
		}

		// This test would never fail on the current implementation since
		// user.profile must be defined or there would be an accessDeniedError.
		// Kept in to preserve type-safety.
		if (!user.profile) {
			return res.status(403).send(makeErrorResponse('No user profile.'));
		}
		const storageResponse = await newsletterStore.update(
			newsletterIdAsNumber,
			modifications,
			user.profile,
		);

		if (!storageResponse.ok) {
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		}

		return makeSuccessResponse(storageResponse.data);
	});

	app.post<{
		Params: { newsletterId: string };
		Body: unknown;
	}>('/api/newsletters/:newsletterId', async (req, res) => {
		const user = getUserProfile(req); //Todo: create middleware to get user profile
		const accessDeniedError = await makeAccessDeniedApiResponse(
			user.profile,
			'editNewsletters',
		);
		if (accessDeniedError) {
			return res.status(403).send(accessDeniedError);
		}

		const { newsletterId } = req.params;
		const { body: newsletter } = req;
		const newsletterIdAsNumber = Number(newsletterId);

		if (isNaN(newsletterIdAsNumber)) {
			return res.status(400).send(makeErrorResponse(`Non numeric id provided`));
		}

		replaceNullWithUndefinedForUnknown(newsletter);

		if (!isNewsletterData(newsletter)) {
			return res.status(400).send(makeErrorResponse(`Not a valid newsletter`));
		}

		if (!user.profile) {
			return res.status(403).send(makeErrorResponse('No user profile'));
		}

		const storageResponse = await newsletterStore.replace(
			newsletterIdAsNumber,
			newsletter,
			user.profile,
		);

		if (!storageResponse.ok) {
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		}

		return makeSuccessResponse(storageResponse.data);
	});
}
