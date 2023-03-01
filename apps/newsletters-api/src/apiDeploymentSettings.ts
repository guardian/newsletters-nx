/**
 * This file contains the settings for the deployment of the API.
 * The API is deployed in 3 ways.
 *  Serving the UI which can be check with isServingUI
 *  Serving the read endpoints which can be checked with isServingReadEndpoints
 *  Serving the read and write endpoints which can be checked with isServingReadWriteEndpoints
 * This is read in main.ts to enable/disable the endpoints
 * @see ./main.ts
 */

function undefinedAndNotProduction(envVar: string | undefined): boolean {
	return envVar === undefined && process.env.NODE !== 'production';
}

export const isServingUI =
	undefinedAndNotProduction(process.env.NEWSETTERS_UI_SERVE) ||
	process.env.NEWSLETTERS_UI_SERVE === 'true';

export const isServingReadWriteEndpoints =
	undefinedAndNotProduction(process.env.NEWSLETTERS_API_READ_WRITE) ||
	process.env.NEWSLETTERS_API_READ_WRITE === 'true';

export const isServingReadEndpoints =
	undefinedAndNotProduction(process.env.NEWSLETTERS_API_READ) ||
	process.env.NEWSLETTERS_API_READ === 'true' ||
	isServingReadWriteEndpoints;
