import { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
import type { Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import { hasEditAccess } from '../authorisation';
import { getUserProfile } from '../get-user-profile';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

const guardianOrigin = 'https://www.theguardian.com';
const maxPathLength = 500;

const pathLengthError = `A non-empty path less than ${maxPathLength} characters is required`;

/** Returns why a path can't be checked, or undefined if it can. */
export const signupPathRequestError = (path: string): string | undefined => {
	if (!path.trim() || path.length > maxPathLength) {
		return pathLengthError;
	}
	return newsletterDataSchema.shape.signupPage.safeParse(path).error?.issues[0]
		?.message;
};

export const checkSignupPath = async (path: string): Promise<boolean> => {
	// prepend the guardian domain and make sure there is only one foward slash after the domain
	let url = new URL(`${guardianOrigin}/${path.replace(/^\/+/, '')}`);
	// set a 10 second timeout
	const signal = AbortSignal.timeout(10000);
	// follow redirects a maximum of 5 times
	for (let redirects = 0; redirects <= 5; redirects++) {
		if (url.origin !== guardianOrigin || url.username || url.password) {
			return false;
		}
		const response = await fetch(url, { redirect: 'manual', signal });
		await response.body?.cancel();
		if (response.ok) {
			return true;
		}
		const location = response.headers.get('location');
		if (![301, 302, 303, 307, 308].includes(response.status) || !location) {
			return false;
		}
		url = new URL(location, url);
	}
	return false;
};

export function registerSignupPathValidationRoute(app: Express) {
	app.get(
		'/api/signup-path-validation',
		rateLimit({
			// not sure what to set the rate limit connection to, but
			// the default of 5 seemed a bit too low
			limit: 50,
			standardHeaders: true,
			legacyHeaders: false,
		}),
		async (req, res) => {
			if (!(await hasEditAccess(getUserProfile(req).profile))) {
				return res
					.status(403)
					.send(makeErrorResponse('You do not have edit access'));
			}
			const { path } = req.query;
			if (typeof path !== 'string') {
				return res.status(400).send(makeErrorResponse(pathLengthError));
			}
			const requestError = signupPathRequestError(path);
			if (requestError) {
				return res.status(400).send(makeErrorResponse(requestError));
			}
			try {
				return res.send(
					makeSuccessResponse({ valid: await checkSignupPath(path) }),
				);
			} catch (error) {
				console.error('Failed to validate sign-up page path', error);
				return res
					.status(502)
					.send(makeErrorResponse('Could not check the sign-up page path'));
			}
		},
	);
}
