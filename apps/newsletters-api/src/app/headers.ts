import type { FastifyReply, FastifyRequest } from 'fastify';
import { isServingUI } from '../apiDeploymentSettings';

type TtlSettings = {
	cacheMaxAge: number;
};

const newsletterTtl: TtlSettings = {
	cacheMaxAge: 60,
};

export const getCacheControl = (
	req: FastifyRequest,
): TtlSettings | undefined => {
	// the API instance serving the UI must always provide fresh data
	if (isServingUI()) {
		return undefined;
	}

	if (req.routerPath.startsWith('/api/newsletters')) {
		return newsletterTtl;
	}
	if (req.routerPath.startsWith('/api/legacy')) {
		return newsletterTtl;
	}
	if (req.routerPath.startsWith('/api/layouts')) {
		return newsletterTtl;
	}

	return undefined;
};

export const setHeaderHook = async (
	req: FastifyRequest,
	reply: FastifyReply,
) => {
	const cacheControl = getCacheControl(req);
	if (!cacheControl) {
		return;
	}

	void reply.header(`Cache-Control`, `max-age=${cacheControl.cacheMaxAge}`);
};
