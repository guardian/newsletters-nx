import {
	isLegacyCancelledNewsletter,
	isLegacyNewsletter,
	isNewsletterData,
} from './editorial-newsletters-ts';

describe('isNewsletterData', () => {
	it('is defined', () => {
		expect(isNewsletterData).toBeDefined();
	});
	it('works', () => {
		expect(isNewsletterData({})).toBe(false);
	});
});

describe('isLegacyNewsletter', () => {
	it('is defined', () => {
		expect(isLegacyNewsletter).toBeDefined();
	});
	it('works', () => {
		expect(isLegacyNewsletter({})).toBe(false);
	});
});

describe('isLegacyCancelledNewsletter', () => {
	it('is defined', () => {
		expect(isLegacyCancelledNewsletter).toBeDefined();
	});
	it('works', () => {
		expect(isLegacyCancelledNewsletter({})).toBe(false);
	});
});
