import type { RequestHandler } from 'express';
import { log } from './logger';

export const requestLoggingMiddleware: RequestHandler = (req, res, next) => {
	if (!req.path.startsWith('/api/')) {
		next();
		return;
	}

	// hrtime gets the time from the OS and is not affected by changes to the system clock
	const startedAt = process.hrtime.bigint();

	res.on('finish', () => {
		const level =
			res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
		log(level, `${req.method} ${req.path} returned ${res.statusCode}`, {
			event: {
				action: 'newsletters_api_request',
				duration: Number(process.hrtime.bigint() - startedAt),
				category: ['web'],
				type: ['access'],
				outcome: res.statusCode >= 500 ? 'failure' : 'success',
			},
			http: {
				request: { method: req.method },
				response: { status_code: res.statusCode },
			},
			url: { path: req.path },
			client: { ip: req.ip },
		});
	});

	next();
};
