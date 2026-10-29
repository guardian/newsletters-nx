import { checkSignupPath } from './signup-path-validation';

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
		expect(await checkSignupPath('news/missing')).toBe(false);
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

	it('does not count a pasted hostname as the destination origin', async () => {
		const fetchMock = jest
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(new Response(null, { status: 404 }));
		await checkSignupPath('//example.com/test');
		expect(fetchMock).toHaveBeenCalledWith(
			new URL('https://www.theguardian.com/example.com/test'),
			expect.anything(),
		);
	});

	it('handles network errors as well as 404s', async () => {
		jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Offline'));
		await expect(checkSignupPath('/news')).rejects.toThrow('Offline');
	});
});
