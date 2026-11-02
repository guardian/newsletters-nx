import {
	checkSignupPath,
	signupPathRequestError,
} from './signup-path-validation';

describe('signupPathRequestError', () => {
	it('accepts a path in the signupPage schema format', () => {
		expect(signupPathRequestError('/global/sign-up-for-news')).toBeUndefined();
	});

	it.each([
		'global/no-leading-slash',
		'/has spaces',
		'/has?query=string',
		'https://www.theguardian.com/global',
	])('rejects %s with the signupPage schema message', (path) => {
		expect(signupPathRequestError(path)).toMatch(
			/^Please add the path of the Guardian URL from the slash/,
		);
	});

	it.each(['', '   ', `/${'a'.repeat(500)}`])(
		'rejects an empty or over-long path',
		(path) => {
			expect(signupPathRequestError(path)).toBe(
				'A non-empty path less than 500 characters is required',
			);
		},
	);
});

describe('checkSignupPath', () => {
	afterEach(() => jest.restoreAllMocks());

	it.each([200, 201, 202])('accepts a %s response', async (status) => {
		const fetchMock = jest
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(new Response(null, { status }));
		expect(await checkSignupPath('/news/example')).toBe(true);
		expect(fetchMock).toHaveBeenCalledWith(
			new URL('https://www.theguardian.com/news/example'),
			expect.anything(),
		);
	});

	it.each([400, 404, 500])('rejects a %s response', async (status) => {
		jest
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(new Response(null, { status }));
		expect(await checkSignupPath('/news/missing')).toBe(false);
	});

	it('follows same-origin redirects', async () => {
		const fetchMock = jest
			.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(
				new Response(null, { status: 301, headers: { location: '/new-path' } }),
			)
			.mockResolvedValueOnce(new Response(null, { status: 200 }));
		expect(await checkSignupPath('/old-path')).toBe(true);
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			new URL('https://www.theguardian.com/new-path'),
			expect.anything(),
		);
	});

	it('never follows redirects to another origin', async () => {
		const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(null, {
				status: 302,
				headers: { location: 'http://127.0.0.1/private' },
			}),
		);
		expect(await checkSignupPath('/redirect')).toBe(false);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('limits redirect loops', async () => {
		const fetchMock = jest
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(
				new Response(null, { status: 302, headers: { location: '/loop' } }),
			);
		expect(await checkSignupPath('/loop')).toBe(false);
		expect(fetchMock).toHaveBeenCalledTimes(6);
	});

	it.each(['news/missing', '//example.com/test', '@evil.com', ''])(
		'rejects the invalid path "%s" without fetching it',
		async (path) => {
			const fetchMock = jest.spyOn(globalThis, 'fetch');
			expect(await checkSignupPath(path)).toBe(false);
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);

	it('handles network errors as well as 404s', async () => {
		jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Offline'));
		await expect(checkSignupPath('/news')).rejects.toThrow('Offline');
	});
});
