import type { FastifyInstance } from 'fastify';

const { FAKE_JWT } = process.env;

const USE_FAKE_JWT = true as boolean;

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
		const jwtProfile = USE_FAKE_JWT
			? FAKE_JWT
			: req.headers['x-amzn-oidc-data'];

		const profile =
			typeof jwtProfile === 'string'
				? {
						body: parseJwt(jwtProfile),
						headers: parseJwt(jwtProfile, 'headers'),
				  }
				: {};

		return res.send(profile);
	});
}
