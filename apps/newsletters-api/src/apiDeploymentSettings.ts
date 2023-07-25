/**
 * This file contains the settings for the deployment of the API.
 * The API is deployed in 3 ways.
 *  Serving the UI which can be checked with isServingUI
 *  Serving the read endpoints which can be checked with isServingReadEndpoints
 *  Serving the read and write endpoints which can be checked with isServingReadWriteEndpoints
 * This is read in main.ts to enable/disable the endpoints
 * @see ./main.ts
 *
 * In development, variables can be adjusted locally on the command line e.g.
 * 	NEWSLETTERS_UI_SERVE=false npm run dev
 *
 * or by creating a .env.local file in the root folder for the newsletters-api project
 */

import { UserAccessLevel } from '@newsletters-nx/newsletters-data-client';

export function isUndefinedAndNotProduction(
	envVar: string | undefined,
): boolean {
	return envVar === undefined && process.env.NODE_ENV !== 'production';
}

export const isServingUI = () => {
	const undefinedAndNotProduction = isUndefinedAndNotProduction(
		process.env.NEWSLETTERS_UI_SERVE,
	);
	const isUIServe = process.env.NEWSLETTERS_UI_SERVE === 'true';
	return undefinedAndNotProduction || isUIServe;
};

export const isServingReadWriteEndpoints = () => {
	const undefinedAndNotProduction = isUndefinedAndNotProduction(
		process.env.NEWSLETTERS_API_READ_WRITE,
	);
	const isApiReadWrite = process.env.NEWSLETTERS_API_READ_WRITE === 'true';
	return undefinedAndNotProduction || isApiReadWrite;
};

export const isDynamicImageSigningEnabled = () => {
	const { ENABLE_DYNAMIC_IMAGE_SIGNING } = process.env;
	return (
		ENABLE_DYNAMIC_IMAGE_SIGNING && ENABLE_DYNAMIC_IMAGE_SIGNING === 'true'
	);
};

export const isServingReadEndpoints = () => {
	const undefinedAndNotProduction = isUndefinedAndNotProduction(
		process.env.NEWSLETTERS_API_READ,
	);
	const isApiRead = process.env.NEWSLETTERS_API_READ === 'true';
	const isApiReadWrite = isServingReadWriteEndpoints();
	return undefinedAndNotProduction || isApiRead || isApiReadWrite;
};

export const isUsingInMemoryStorage = () =>
	process.env.USE_IN_MEMORY_STORAGE === 'true';

export const getTestJwtProfileDataIfUsing = () => {
	return process.env.USE_FAKE_JWT === 'true' ? process.env.FAKE_JWT : undefined;
};

export const getLocalUserProfiles = (): Record<string, UserAccessLevel> => {
	const json = process.env.USER_PERMISSIONS;
	if (!json) {
		return {};
	}
	try {
		const data = JSON.parse(json) as Record<string, unknown> | unknown[];
		if (Array.isArray(data)) {
			console.warn(
				'USER PROFILE PARSE FAILED - data was array',
				data as unknown,
			);
			console.warn(`USER_PERMISSIONS=${process.env.USER_PERMISSIONS ?? ''}`);
			return {};
		}

		const output: Record<string, UserAccessLevel> = {};

		for (const key in data) {
			const value = data[key];
			switch (value) {
				case UserAccessLevel.Developer:
				case UserAccessLevel.Editor:
				case UserAccessLevel.Drafter:
				case UserAccessLevel.Viewer:
					output[key] = value;
					break;
			}
		}
		return output;
	} catch (err) {
		console.warn('USER PROFILE PARSE FAILED - JSON error', err as unknown);
		console.warn(`USER_PERMISSIONS=${process.env.USER_PERMISSIONS ?? ''}`);
		return {};
	}
};

const EMAIL_RENDERING_LOCAL = 'http://localhost:3010';
const EMAIL_RENDERING = 'https://email-rendering.guardianapis.com';
export const getEmailRenderingHost = (): string => {
	return process.env.USE_LOCAL_EMAIL_RENDERING
		? EMAIL_RENDERING_LOCAL
		: EMAIL_RENDERING;
};
