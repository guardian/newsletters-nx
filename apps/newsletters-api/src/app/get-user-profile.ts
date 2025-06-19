import type { Request } from 'express'
import type { UserProfile } from '@newsletters-nx/newsletters-data-client';
import { getTestJwtProfileDataIfUsing } from '../apiDeploymentSettings';
import { getDeveloperProfile } from "../services/permissions/developer-profile-service";

const atob = (a: string) => Buffer.from(a, 'base64').toString('binary');

function parseJwt(
	token: string,
	bodyOrHeader: 'body' | 'headers' = 'body',
): UserProfile | undefined {
	try {
		const base64Url = token.split('.')[
			bodyOrHeader === 'headers' ? 0 : 1
		] as string;
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map(function (c) {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join(''),
		);
		return JSON.parse(jsonPayload) as UserProfile;
	} catch (err: unknown) {
		console.warn('failed to parseJwt', err);
		return undefined;
	}
}

export const getUserProfile = (
	req: Request,
): { profile: UserProfile } | { errorMessage: string; profile: undefined } => {
	const { USE_DEVELOPER_PROFILE } = process.env;
	const jwtProfile =
		req.headers['x-amzn-oidc-data'] ?? getTestJwtProfileDataIfUsing();

	if (USE_DEVELOPER_PROFILE && USE_DEVELOPER_PROFILE === "true") {
		console.info('getUserProfile: USE_DEVELOPER_PROFILE is true, returning developer profile.');
		return getDeveloperProfile();
	}

	if (typeof jwtProfile !== 'string') {
		return { errorMessage: 'No user profile.', profile: undefined };
	}

	const decodedJwtProfile = parseJwt(jwtProfile);

	if (!decodedJwtProfile) {
		return {
			errorMessage: 'Failed to decode user profile.',
			profile: undefined,
		};
	}

	return { profile: decodedJwtProfile };
};
