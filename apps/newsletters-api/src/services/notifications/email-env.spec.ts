import { splitEmailConfig } from './email-env';

describe('splitEmailConfig', () => {
	it('will split a string of semi-colon separated email addresses, allowing for spaces', () => {
		const expectedResult = [
			'test@example.com',
			'tester@stack.net',
			'blue-green@color.net',
		];

		expect(
			splitEmailConfig(
				'test@example.com;tester@stack.net;blue-green@color.net',
			),
		).toEqual(expectedResult);
		expect(
			splitEmailConfig(
				'test@example.com; tester@stack.net;blue-green@color.net; ',
			),
		).toEqual(expectedResult);
		expect(
			splitEmailConfig(
				'test@example.com; tester@stack.net;;;blue-green@color.net; ',
			),
		).toEqual(expectedResult);
	});

	it('will filter out invalid email addresses', () => {
		const expectedResult = ['test@example.com', 'blue-green@color.net'];
		expect(
			splitEmailConfig(
				"test@example.com;john's email;blue-green@color.net;m@rk.m@rcks.com",
			),
		).toEqual(expectedResult);
	});
	it('will return an empty array if passed an undefined', () => {
		expect(splitEmailConfig(undefined)).toEqual([]);
	});
});
