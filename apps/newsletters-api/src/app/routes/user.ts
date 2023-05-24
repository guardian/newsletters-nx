import type { FastifyInstance } from 'fastify';
import { getTestJwtProfileDataIfUsing } from '../../apiDeploymentSettings';

const atob = (a: string) => Buffer.from(a, 'base64').toString('binary');

function parseJwt(
	token: string,
	bodyOrHeader: 'body' | 'headers' = 'body',
): Partial<Record<string, string>> {
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
		return JSON.parse(jsonPayload) as Partial<Record<string, string>>;
	} catch (err: unknown) {
		console.warn('failed to parseJwt', err);
		return {};
	}
}

export function registerUserRoute(app: FastifyInstance) {
	app.get('/api/user/whoami', async (req, res) => {
		const jwtProfile =
			req.headers['x-amzn-oidc-data'] ?? getTestJwtProfileDataIfUsing();

		const decodedJwtProfile =
			typeof jwtProfile === 'string' ? parseJwt(jwtProfile) : {};

		return res.send(decodedJwtProfile);
	});
}
