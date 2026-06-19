import type { RequestHandler } from 'express';

export const requestLoggingMiddleware: RequestHandler = (req, res, next) => {
	if (!req.path.startsWith('/api/')) {
		next();
		return;
	}

	const startedAt = Date.now();

	res.on('finish', () => {
		console.log(
			JSON.stringify({
				event: 'newsletters_api_request',
				method: req.method,
				path: req.path,
				status: res.statusCode,
				durationMs: Date.now() - startedAt,
				referer: req.headers.referer,
				userAgent: req.headers['user-agent'],
			}),
		);
	});

	next();
};
