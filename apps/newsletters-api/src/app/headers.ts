import type { FastifyReply, FastifyRequest } from 'fastify';

export const getCacheControl = (req: FastifyRequest) => {
	if (req.routerPath.startsWith('/api/newsletters')) {
		return {
			age: '60',
		};
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

	void reply.header(`Cache-Control`, `max-age=${cacheControl.age}`);
};
