/**
 * This file contains the settings for the deployment of the API.
 * The API is deployed in 3 ways.
 *  Serving the UI which can be check with isServingUI
 *  Serving the read endpoints which can be checked with isServingReadEndpoints
 *  Serving the read and write endpoints which can be checked with isServingReadWriteEndpoints
 * This is read in main.ts to enable/disable the endpoints
 * @see ./main.ts
 */

export const isServingUI =
	(process.env.NEWSLETTERS_UI_SERVE === undefined &&
		process.env.NODE_ENV !== 'production') ||
	process.env.NEWSLETTERS_UI_SERVE === 'true';

export const isServingReadWriteEndpoints =
	(process.env.NEWSLETTERS_API_READ_WRITE === undefined &&
		process.env.NODE_ENV !== 'production') ||
	process.env.NEWSLETTERS_API_READ_WRITE === 'true';

export const isServingReadEndpoints =
	(process.env.NEWSLETTERS_API_READ === undefined &&
		process.env.NODE_ENV !== 'production') ||
	process.env.NEWSLETTERS_API_READ === 'true' ||
	isServingReadWriteEndpoints;
