import type { FastifyInstance, FastifyReply } from 'fastify';
import type { FastifyRequest } from 'fastify/types/request';
import {
	isNewsletterData,
	isPartialNewsletterData,
	replaceNullWithUndefinedForUnknown,
	transformDataToLegacyNewsletter,
} from '@newsletters-nx/newsletters-data-client';
import { isDynamicImageSigningEnabled } from '../../apiDeploymentSettings';
import { signTemplateImages } from '../../services/image/image-signer';
import { newsletterStore } from '../../services/storage';
import {
	hasEditAccess,
	isAuthorisedToUpdateNewsletter,
} from '../authorisation';
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

	interface IQuerystring {
		signImages: boolean;
	}

	app.get<{ Querystring: IQuerystring }>(
		'/api/newsletters',
		async (req, res) => {
			const storageResponse = await newsletterStore.list();

			if (!storageResponse.ok) {
				return res
					.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
					.send(makeErrorResponse(storageResponse.message));
			}
			const { signImages } = req.query;
			if (isDynamicImageSigningEnabled() && signImages) {
				const newsletterDataWithSignedImages = await Promise.all(
					storageResponse.data.map(signTemplateImages),
				);
				return makeSuccessResponse(newsletterDataWithSignedImages);
			}
			return makeSuccessResponse(storageResponse.data);
		},
	);

	app.get<{
		Params: { newsletterId: string };
		Querystring: IQuerystring;
	}>('/api/newsletters/:newsletterId', async (req, res) => {
		const { newsletterId } = req.params;
		const storageResponse = await newsletterStore.readByName(newsletterId);

		if (!storageResponse.ok) {
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		}
		const { signImages } = req.query;
		if (isDynamicImageSigningEnabled() && signImages) {
			const newsletterDataWithSignedImages = await signTemplateImages(
				storageResponse.data,
			);
			return makeSuccessResponse(newsletterDataWithSignedImages);
		}
		return makeSuccessResponse(storageResponse.data);
	});
}

export function registerReadWriteNewsletterRoutes(app: FastifyInstance) {
	const hasAccessHook = async (
		request: FastifyRequest,
		reply: FastifyReply,
	) => {
		const user = getUserProfile(request);
		const isAuthorised = await hasEditAccess(user.profile);
		const isAuthorisedForUpdate = await isAuthorisedToUpdateNewsletter(
			user.profile,
			request,
		);
		if (!isAuthorised || !isAuthorisedForUpdate) {
			void reply.status(403).send(makeErrorResponse('You do not have edit access'));
		}
	};

	app.patch<{
		Params: { newsletterId: string };
		Body: unknown;
	}>(
		'/api/newsletters/:newsletterId',
		{ preValidation: hasAccessHook },
		async (req, res) => {
			const user = getUserProfile(req);

			const { newsletterId } = req.params;
			const { body: modifications } = req;
			const newsletterIdAsNumber = Number(newsletterId);

			if (isNaN(newsletterIdAsNumber)) {
				return res
					.status(400)
					.send(makeErrorResponse(`Non numeric id provided`));
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
		},
	);

	app.post<{
		Params: { newsletterId: string };
		Body: unknown;
	}>(
		'/api/newsletters/:newsletterId',
		{ preValidation: hasAccessHook },
		async (req, res) => {
			const user = getUserProfile(req);
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
				return res
					.status(400)
					.send(makeErrorResponse(`Non numeric id provided`));
			}

			replaceNullWithUndefinedForUnknown(newsletter);

			if (!isNewsletterData(newsletter)) {
				return res
					.status(400)
					.send(makeErrorResponse(`Not a valid newsletter`));
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
		},
	);
}
