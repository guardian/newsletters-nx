import {
	isLegacyCancelledNewsletter,
	isLegacyNewsletter,
	isNewsletterData,
} from './editorial-newsletters-ts';

describe('isNewsletterData', () => {
	test('is defined', () => {
		expect(isNewsletterData).toBeDefined();
	});
	test('works', () => {
		expect(isNewsletterData({})).toBe(false);
	});
});

describe('isLegacyNewsletter', () => {
	test('is defined', () => {
		expect(isLegacyNewsletter).toBeDefined();
	});
	test('works', () => {
		expect(isLegacyNewsletter({})).toBe(false);
	});
});

describe('isLegacyCancelledNewsletter', () => {
	test('is defined', () => {
		expect(isLegacyCancelledNewsletter).toBeDefined();
	});
	test('works', () => {
		expect(isLegacyCancelledNewsletter({})).toBe(false);
	});
});
