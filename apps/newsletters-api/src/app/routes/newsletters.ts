import type { Express, Request, Response } from 'express';
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
	isAuthorisedToMakeRequestedNewsletterUpdate,
} from '../authorisation';
import { getUserProfile } from '../get-user-profile';
import { queryParamToBoolean } from '../params';
import {
	makeAccessDeniedApiResponse,
	makeErrorResponse,
	makeSuccessResponse,
	mapStorageFailureReasonToStatusCode,
} from '../responses';

export function registerReadNewsletterRoutes(app: Express) {
	// not using the makeSuccess function on this route as
	// we are emulating the response of the legacy API
	app.get('/api/legacy/newsletters', async (req, res) => {
		const storageResponse = await newsletterStore.list();
		if (!storageResponse.ok) {
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		}

		return res.send(storageResponse.data.map(transformDataToLegacyNewsletter));
	});

	app.get(
		'/api/newsletters',
		async (req, res) => {
			const storageResponse = await newsletterStore.list();

			if (!storageResponse.ok) {
				return res
					.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
					.send(makeErrorResponse(storageResponse.message));
			}
			const { signImages } = req.query;
			if (isDynamicImageSigningEnabled() && queryParamToBoolean(signImages)) {
				const newsletterDataWithSignedImages = await Promise.all(
					storageResponse.data.map(signTemplateImages),
				);
				return res.send(makeSuccessResponse(newsletterDataWithSignedImages));
			}
			return res.send(makeSuccessResponse(storageResponse.data));
		},
	);

	app.get('/api/newsletters/:newsletterId', async (req, res) => {
		const { newsletterId } = req.params;
		const storageResponse = await newsletterStore.readByName(newsletterId);

		if (!storageResponse.ok) {
			return res
				.status(mapStorageFailureReasonToStatusCode(storageResponse.reason))
				.send(makeErrorResponse(storageResponse.message));
		}
		const { signImages } = req.query;
		if (isDynamicImageSigningEnabled() && queryParamToBoolean(signImages)) {
			const newsletterDataWithSignedImages = await signTemplateImages(
				storageResponse.data,
			);
			return res.send(makeSuccessResponse(newsletterDataWithSignedImages));
		}
		return res.send(makeSuccessResponse(storageResponse.data));
	});
}

export function registerReadWriteNewsletterRoutes(app: Express) {
	const doesNotHaveAccess = async (
		request: Request,
		reply: Response,
	) => {
		const user = getUserProfile(request);
		const isAuthorised = await hasEditAccess(user.profile);
		const body = request.body as unknown;
		const update = replaceNullWithUndefinedForUnknown(body);

		if (!isPartialNewsletterData(update)) {
			void reply.status(400).send(makeErrorResponse('invalid update data'));
			return true
		}

		const isAuthorisedForUpdate =
			await isAuthorisedToMakeRequestedNewsletterUpdate(user.profile, update);
		if (!isAuthorised || !isAuthorisedForUpdate) {
			void reply
				.status(403)
				.send(makeErrorResponse('You do not have edit access'));
			return true
		}
		return false
	};

	app.patch(
		'/api/newsletters/:newsletterId',
		async (req, res) => {

			const failedValidation = await doesNotHaveAccess(req, res);
			if (failedValidation) {
				return
			}

			const user = getUserProfile(req);

			const { newsletterId } = req.params;
			const modifications = req.body as unknown;
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

			return res.send(makeSuccessResponse(storageResponse.data));
		},
	);

	app.post(
		'/api/newsletters/:newsletterId',
		async (req, res) => {

			const failedValidation = await doesNotHaveAccess(req, res);
			if (failedValidation) {
				return
			}

			const user = getUserProfile(req);
			const accessDeniedError = await makeAccessDeniedApiResponse(
				user.profile,
				'editNewsletters',
			);
			if (accessDeniedError) {
				return res.status(403).send(accessDeniedError);
			}

			const { newsletterId } = req.params;
			const newsletter = req.body as unknown;
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

			return res.send(makeSuccessResponse(storageResponse.data));
		},
	);
}
