import type { UserProfile } from '@newsletters-nx/newsletters-data-client';
import { AlbJwtVerifier } from 'aws-jwt-verify';
import { decomposeUnverifiedJwt } from 'aws-jwt-verify/jwt';
import type { Request } from 'express';
import {
	getTestJwtProfileDataIfUsing,
	isJwtVerificationEnabled,
} from '../apiDeploymentSettings';
import { getDeveloperProfile } from '../services/permissions/developer-profile-service';
import { errorContext, log } from './logger';

const createVerifier = () => {
	const { ALB_ARN, GOOGLE_CLIENT_ID } = process.env;
	if (!ALB_ARN || !GOOGLE_CLIENT_ID) {
		log(
			'error',
			'process.env.ALB_ARN and process.env.GOOGLE_CLIENT_ID must both be configured.',
		);
		throw new Error('ALB_ARN and GOOGLE_CLIENT_ID must be configured.');
	}
	return AlbJwtVerifier.create({
		albArn: ALB_ARN,
		clientId: GOOGLE_CLIENT_ID,
		// We expect a google login
		issuer: 'https://accounts.google.com',
	});
};

export const getUserProfile = async (
	req: Pick<Request, 'headers'>,
): Promise<
	{ profile: UserProfile } | { errorMessage: string; profile: undefined }
> => {
	const { USE_DEVELOPER_PROFILE } = process.env;
	const jwtProfile =
		req.headers['x-amzn-oidc-data'] ?? getTestJwtProfileDataIfUsing();

	if (USE_DEVELOPER_PROFILE && USE_DEVELOPER_PROFILE === 'true') {
		log(
			'info',
			'getUserProfile: USE_DEVELOPER_PROFILE is true, returning developer profile.',
		);
		return getDeveloperProfile();
	}

	if (typeof jwtProfile !== 'string') {
		return { errorMessage: 'No user profile.', profile: undefined };
	}

	return getUserProfileFromJWT(jwtProfile);
};

/**
 * Returns a singleton verifier instance.
 * This enables use to reuse a long-lived verifier that can cache JWKs
 */
const getVerifier = (() => {
	let verifier: ReturnType<typeof createVerifier> | null = null;

	return () => {
		verifier ??= createVerifier();
		return verifier;
	};
})();

export const getUserProfileFromJWT = async (
	jwtProfile: string,
): Promise<
	{ profile: UserProfile } | { errorMessage: string; profile: undefined }
> => {
	try {
		const payload = isJwtVerificationEnabled()
			? // This is async because the aws-jwt-verify may need to download the public key for the sign JWTs, if not yet cached.
				await getVerifier().verify(jwtProfile)
			: decomposeUnverifiedJwt(jwtProfile).payload;

		return { profile: payload };
	} catch (error) {
		log('warn', 'Failed to load user profile from JWT', errorContext(error));

		return {
			errorMessage: 'Failed to load user profile.',
			profile: undefined,
		};
	}
};
