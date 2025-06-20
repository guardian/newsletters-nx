import { Request, RequestHandler, Response } from 'express'

import { isServingUI } from '../apiDeploymentSettings';

type TtlSettings = {
	cacheMaxAge: number;
};

const newsletterTtl: TtlSettings = {
	cacheMaxAge: 60,
};

export const getCacheControl = (
	req: Request,
): TtlSettings | undefined => {
	// the API instance serving the UI must always provide fresh data
	if (isServingUI()) {
		return undefined;
	}

	if (req.path.startsWith('/api/newsletters')) {
		return newsletterTtl;
	}
	if (req.path.startsWith('/api/legacy')) {
		return newsletterTtl;
	}
	if (req.path.startsWith('/api/layouts')) {
		return newsletterTtl;
	}

	return undefined;
};

export const setCacheControlHeaderMiddleware: RequestHandler = async (
	req: Request,
	res: Response,
	next
) => {
	const cacheControl = getCacheControl(req);
	if (cacheControl) {
		res.header(`Cache-Control`, `max-age=${cacheControl.cacheMaxAge}`);
	}
	next();
};
