import { once } from 'node:events';
import type { Server } from 'node:http';
import express, { json } from 'express';
import type { ErrorRequestHandler } from 'express';
import { requestLoggingMiddleware } from './request-logging';

describe('requestLoggingMiddleware', () => {
	let server: Server;
	let origin: string;
	const app = express();

	beforeAll(async () => {
		app.use(requestLoggingMiddleware);
		app.use(json());
		app.get('/api/status/:status', (req, res) => {
			res.sendStatus(Number(req.params.status));
		});
		app.post('/api/json', (_req, res) => res.sendStatus(200));
		app.get('/healthcheck', (_req, res) => res.sendStatus(200));
		const handleError: ErrorRequestHandler = (error, _req, res, next) => {
			if (res.headersSent) {
				next(error);
				return;
			}
			res.sendStatus(400);
		};
		app.use(handleError);
		server = app.listen(0, '127.0.0.1');
		await once(server, 'listening');
		const address = server.address();
		if (!address || typeof address === 'string') {
			throw new Error('Expected the test server to listen on a TCP port');
		}
		origin = `http://127.0.0.1:${address.port}`;
	});

	afterAll(async () => {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => (error ? reject(error) : resolve()));
		});
	});

	beforeEach(() => {
		app.set('trust proxy', 1);
		jest.replaceProperty(process, 'env', {
			...process.env,
			APP: 'newsletters-api',
			STACK: 'newsletters',
			STAGE: 'CODE',
		});
		jest.spyOn(console, 'log').mockImplementation(() => undefined);
		jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => jest.restoreAllMocks());

	it.each([
		{ status: 200, level: 'info' },
		{ status: 302, level: 'info' },
		{ status: 400, level: 'warn' },
		{ status: 404, level: 'warn' },
		{ status: 500, level: 'error' },
		{ status: 502, level: 'error' },
	] as const)(
		'logs $status responses at $level on stdout',
		async ({ status, level }) => {
			const response = await fetch(`${origin}/api/status/${status}`);
			await response.text();
			expect(response.status).toBe(status);
			expect(console.log).toHaveBeenCalledTimes(1);
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining(`"level":"${level}"`),
			);
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining(`"status_code":${status}`),
			);
			expect(console.warn).not.toHaveBeenCalled();
			expect(console.error).not.toHaveBeenCalled();
		},
	);

	it.each(['newsletters-tool', 'newsletters-api'])(
		'includes deployment metadata and request context for %s without sensitive headers or query strings',
		async (appName) => {
			process.env.APP = appName;
			const response = await fetch(`${origin}/api/status/200?token=secret`, {
				headers: {
					authorization: 'Bearer secret',
					cookie: 'session=secret',
					referer: 'https://example.com/?token=secret',
					'x-gu-api-key': 'secret',
					'x-amzn-oidc-data': 'secret',
					'user-agent': 'private-client',
				},
			});
			await response.text();
			const log: unknown = jest.mocked(console.log).mock.calls[0]?.[0];
			expect(typeof log).toBe('string');
			if (typeof log !== 'string') {
				throw new Error('Expected a JSON log line');
			}
			expect(JSON.parse(log)).toMatchObject({
				ecs: { version: '9.5.0' },
				log: { level: 'info' },
				message: 'GET /api/status/200 returned 200',
				service: { name: appName, environment: 'CODE' },
				labels: { stack: 'newsletters' },
				event: {
					action: 'newsletters_api_request',
					category: ['web'],
					type: ['access'],
					outcome: 'success',
				},
				http: {
					request: { method: 'GET' },
					response: { status_code: 200 },
				},
				url: { path: '/api/status/200' },
			});
			expect(log).toMatch(/"@timestamp":"\d{4}-\d{2}-\d{2}T[^"]+Z"/);
			expect(log).toMatch(/"duration":\d+/);
			expect(log).not.toContain('secret');
			expect(log).not.toContain('private-client');
		},
	);

	it('logs malformed JSON rejected by the body parser', async () => {
		const response = await fetch(`${origin}/api/json`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: '{"invalid"',
		});
		await response.text();
		expect(response.status).toBe(400);
		expect(console.log).toHaveBeenCalledTimes(1);
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining('"status_code":400'),
		);
	});

	it.each(['203.0.113.42', '2001:db8::42'])(
		'logs the ALB-appended client IP %s rather than a spoofed earlier address',
		async (ip) => {
			const response = await fetch(`${origin}/api/status/200`, {
				headers: { 'x-forwarded-for': `198.51.100.99, ${ip}` },
			});
			await response.text();
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining(`"client":{"ip":"${ip}"}`),
			);
			expect(console.log).not.toHaveBeenCalledWith(
				expect.stringContaining('198.51.100.99'),
			);
		},
	);

	it('uses the socket IP when no forwarded address is present', async () => {
		const response = await fetch(`${origin}/api/status/200`);
		await response.text();
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining('"client":{"ip":"127.0.0.1"}'),
		);
	});

	it('ignores forwarded addresses when proxy trust is disabled locally', async () => {
		app.set('trust proxy', false);
		const response = await fetch(`${origin}/api/status/200`, {
			headers: { 'x-forwarded-for': '203.0.113.42' },
		});
		await response.text();
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining('"client":{"ip":"127.0.0.1"}'),
		);
	});
	it('does not log health checks or other non-API requests', async () => {
		const response = await fetch(`${origin}/healthcheck`);
		await response.text();
		expect(console.log).not.toHaveBeenCalled();
		expect(console.warn).not.toHaveBeenCalled();
		expect(console.error).not.toHaveBeenCalled();
	});
});
