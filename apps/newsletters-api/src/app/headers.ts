import type { FastifyReply, FastifyRequest } from 'fastify';

type TtlSettings = {
	cacheMaxAge: number;
	surrogateMaxAge: number;
};

const newsletterTtl: TtlSettings = {
	cacheMaxAge: 60,
	surrogateMaxAge: 360,
};

export const getCacheControl = (
	req: FastifyRequest,
): TtlSettings | undefined => {
	if (req.routerPath.startsWith('/api/newsletters')) {
		return newsletterTtl;
	}
	if (req.routerPath.startsWith('/api/legacy')) {
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

	// Fastly gives priority to the Surrogate-Control header to determine how often to
	// refresh the data from the origin server
	// https://docs.fastly.com/en/guides/caching-best-practices#understand-how-cache-control-headers-work
	void reply.header(
		`Surrogate-Control`,
		`max-age=${cacheControl.surrogateMaxAge}`,
	);
	void reply.header(`Cache-Control`, `max-age=${cacheControl.cacheMaxAge}`);
};
