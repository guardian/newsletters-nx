import type { FastifyRequest } from 'fastify/types/request';
import type { UserProfile } from '@newsletters-nx/newsletters-data-client';
import { getTestJwtProfileDataIfUsing } from '../apiDeploymentSettings';

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
	req: FastifyRequest,
): { ok: true; profile: UserProfile } | { ok: false; errorMessage: string } => {
	const jwtProfile =
		req.headers['x-amzn-oidc-data'] ?? getTestJwtProfileDataIfUsing();

	if (typeof jwtProfile !== 'string') {
		return { ok: false, errorMessage: 'No user profile.' };
	}

	const decodedJwtProfile = parseJwt(jwtProfile);

	if (!decodedJwtProfile) {
		return { ok: false, errorMessage: 'Failed to decode user profile.' };
	}

	return { profile: decodedJwtProfile, ok: true };
};
