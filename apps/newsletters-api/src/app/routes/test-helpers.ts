import type { Express, Request, Response } from 'express';

/** Captures the handlers registered on a fake Express app so they can be invoked directly, without booting a real server. */
export const makeFakeApp = () => {
	const handlers = new Map<string, (req: Request, res: Response) => unknown>();
	const app = {
		get: (path: string, handler: (req: Request, res: Response) => unknown) => {
			handlers.set(`GET ${path}`, handler);
		},
		delete: (
			path: string,
			handler: (req: Request, res: Response) => unknown,
		) => {
			handlers.set(`DELETE ${path}`, handler);
		},
	} as unknown as Express;
	return {
		app,
		get: (path: string) => handlers.get(`GET ${path}`),
	};
};

export const makeMockResponse = () => {
	const send = jest.fn<Response, [unknown]>().mockReturnThis();
	const status = jest.fn<Response, [number]>().mockReturnThis();
	const res = { status, send } as unknown as Response;
	return { res, send };
};

/**
 * Registers routes on a fake app, invokes the GET handler for `path` with the
 * given request, and returns whatever was passed to `res.send(...)`.
 * Centralises the app/response plumbing shared by route spec files.
 */
export const invokeGetRoute = async <T = unknown>(
	registerRoutes: (app: Express) => void,
	path: string,
	req: Partial<Request> = {},
): Promise<T> => {
	const { app, get } = makeFakeApp();
	registerRoutes(app);
	const { res, send } = makeMockResponse();

	await get(path)?.(req as Request, res);

	return send.mock.calls[0]?.[0] as T;
};
