import type { UserProfile } from '@newsletters-nx/newsletters-data-client';
import { UserProfileSchema } from '@newsletters-nx/newsletters-data-client';
import { AlbJwtVerifier } from 'aws-jwt-verify';
import { decomposeUnverifiedJwt } from 'aws-jwt-verify/jwt';
import type { Request } from 'express';
import { z } from 'zod';
import {
	getTestJwtProfileDataIfUsing,
	isJwtVerificationEnabled,
} from '../apiDeploymentSettings';
import { getDeveloperProfile } from '../services/permissions/developer-profile-service';

const jwtProfileSchema = UserProfileSchema.extend({
	sub: z.string().min(1),
});

const createVerifier = () => {
	const { ALB_ARN, GOOGLE_CLIENT_ID } = process.env;
	if (!ALB_ARN || !GOOGLE_CLIENT_ID) {
		throw new Error('ALB_ARN and GOOGLE_CLIENT_ID must be configured.');
	}
	return AlbJwtVerifier.create({
		albArn: ALB_ARN,
		clientId: GOOGLE_CLIENT_ID,
		// We expect a google login
		issuer: 'https//accounts.google.com',
	});
};

let verifier: ReturnType<typeof createVerifier> | undefined;

export const getUserProfile = async (
	req: Pick<Request, 'headers'>,
): Promise<
	{ profile: UserProfile } | { errorMessage: string; profile: undefined }
> => {
	const { USE_DEVELOPER_PROFILE } = process.env;
	const jwtProfile =
		req.headers['x-amzn-oidc-data'] ?? getTestJwtProfileDataIfUsing();

	if (USE_DEVELOPER_PROFILE && USE_DEVELOPER_PROFILE === 'true') {
		console.info(
			'getUserProfile: USE_DEVELOPER_PROFILE is true, returning developer profile.',
		);
		return getDeveloperProfile();
	}

	if (typeof jwtProfile !== 'string') {
		return { errorMessage: 'No user profile.', profile: undefined };
	}

	return getUserProfileFromJWT(jwtProfile);
};

export const getUserProfileFromJWT = async (
	jwtProfile: string,
): Promise<
	{ profile: UserProfile } | { errorMessage: string; profile: undefined }
> => {
	try {
		const payload = isJwtVerificationEnabled()
			? await (verifier ??= createVerifier()).verify(jwtProfile)
			: decomposeUnverifiedJwt(jwtProfile).payload;
		return { profile: jwtProfileSchema.parse(payload) };
	} catch (error) {
		console.warn(
			'Failed to verify user profile.',
			error instanceof Error ? error.message : 'Unknown verification error',
		);
		return {
			errorMessage: 'Failed to verify user profile.',
			profile: undefined,
		};
	}
};
