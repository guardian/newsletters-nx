import { errorContext, log } from './logger';

describe('ECS logger', () => {
	afterEach(() => jest.restoreAllMocks());

	it('writes one JSON line with a timestamp and ECS metadata to stdout', () => {
		const output = jest
			.spyOn(console, 'log')
			.mockImplementation(() => undefined);
		jest.replaceProperty(process, 'env', {
			...process.env,
			APP: 'newsletters-tool',
			STAGE: 'CODE',
			STACK: 'newsletters',
		});
		log('error', 'Operation failed', errorContext(new Error('secret\nvalue')));
		expect(output).toHaveBeenCalledTimes(1);
		const line: unknown = output.mock.calls[0]?.[0];
		if (typeof line !== 'string') {
			throw new Error('Expected a JSON string');
		}
		expect(JSON.parse(line)).toMatchObject({
			ecs: { version: '9.5.0' },
			log: { level: 'error' },
			message: 'Operation failed',
			service: { name: 'newsletters-tool', environment: 'CODE' },
			labels: { stack: 'newsletters' },
			error: { type: 'Error' },
		});
		// the following pattern checks for the presence of the timestamp
		// example of a timestamp in the expected format: "1997-08-29T06:14:00Z"
		expect(line).toMatch(/"@timestamp":"\d{4}-\d{2}-\d{2}T[^"]+Z"/);
		expect(line).not.toContain('secret');
		expect(line).not.toContain('\n');
	});

	it('does not serialize arbitrary thrown objects', () => {
		expect(errorContext({ password: 'secret' })).toEqual({
			error: { type: 'UnknownError' },
		});
	});

	it('keeps client and url as strings for the shared ELK mappings', () => {
		const output = jest
			.spyOn(console, 'log')
			.mockImplementation(() => undefined);
		log('info', 'Request completed', {
			client: '203.0.113.42',
			url: '/api/newsletters',
		});
		const line: unknown = output.mock.calls[0]?.[0];
		if (typeof line !== 'string') {
			throw new Error('Expected a JSON string');
		}
		expect(JSON.parse(line)).toMatchObject({
			client: '203.0.113.42',
			url: '/api/newsletters',
		});
	});
});
