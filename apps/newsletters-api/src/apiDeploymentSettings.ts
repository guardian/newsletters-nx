/**
 * This file contains the settings for the deployment of the API.
 * The API is deployed in 3 ways.
 *  Serving the UI which can be check with isServingUI
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

export const isServingReadEndpoints = () => {
	const undefinedAndNotProduction = isUndefinedAndNotProduction(
		process.env.NEWSLETTERS_API_READ,
	);
	const isApiRead = process.env.NEWSLETTERS_API_READ === 'true';
	const isApiReadWrite = isServingReadWriteEndpoints();
	return undefinedAndNotProduction || isApiRead || isApiReadWrite;
};

export const isUsingInMemoryStorage = () =>
	process.env.USE_LOCAL_STORAGE === 'true';
