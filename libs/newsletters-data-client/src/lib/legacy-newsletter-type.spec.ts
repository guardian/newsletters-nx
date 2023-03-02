import { VALID_TECHSCAPE } from '../fixtures/newsletter-fixtures';
import type {
	LegacyCancelledNewsletter,
	LegacyNewsletter,
} from './legacy-newsletter-type';
import {
	isLegacyCancelledNewsletter,
	isLegacyNewsletter,
} from './legacy-newsletter-type';

describe('isLegacyNewsletter', () => {
	it('Will return true for a valid newsletter', () => {
		expect(isLegacyNewsletter(VALID_TECHSCAPE)).toBe(true);
	});

	it('Will return false for any falsy input or non-object', () => {
		expect(isLegacyNewsletter(false)).toBe(false);
		expect(isLegacyNewsletter(null)).toBe(false);
		expect(isLegacyNewsletter(undefined)).toBe(false);
		expect(isLegacyNewsletter(0)).toBe(false);
		expect(isLegacyNewsletter(10)).toBe(false);
		expect(isLegacyNewsletter('')).toBe(false);
		expect(isLegacyNewsletter('unexpected string')).toBe(false);
	});

	it('Will return false for non-matching object', () => {
		expect(isLegacyNewsletter({})).toBe(false);
		expect(isLegacyNewsletter({ id: 'foo' })).toBe(false);
		expect(isLegacyNewsletter(new Error('Runtime problem'))).toBe(false);
	});

	it('Requires the identityName to be defined and not an empty string', () => {
		const techscapeWithEmptyIdentityName: LegacyNewsletter = {
			...VALID_TECHSCAPE,
			identityName: '',
		};
		const techscapeWithNoIdentityName = {
			...VALID_TECHSCAPE,
			identityName: undefined,
		};
		expect(isLegacyNewsletter(techscapeWithEmptyIdentityName)).toBe(false);
		expect(isLegacyNewsletter(techscapeWithNoIdentityName)).toBe(false);
	});

	it('Requires a desciption', () => {
		const techscapeWithEmptyDescription: LegacyNewsletter = {
			...VALID_TECHSCAPE,
			description: '',
		};
		const techscapeWithNoDescription = {
			...VALID_TECHSCAPE,
			description: undefined,
		};
		expect(isLegacyNewsletter(techscapeWithEmptyDescription)).toBe(false);
		expect(isLegacyNewsletter(techscapeWithNoDescription)).toBe(false);
	});
});

describe('isLegacyCancelledNewsletter', () => {
	it('Only returns true if the newsletter is set to cancelled', () => {
		const cancelledTechscape = { ...VALID_TECHSCAPE, cancelled: true };
		expect(isLegacyCancelledNewsletter(VALID_TECHSCAPE)).toBe(false);
		expect(isLegacyCancelledNewsletter(cancelledTechscape)).toBe(true);
	});

	it('allows the description to be missing', () => {
		const techscapeWithEmptyDescription: LegacyCancelledNewsletter = {
			...VALID_TECHSCAPE,
			description: '',
			cancelled: true,
		};
		const techscapeWithNoDescription = {
			...VALID_TECHSCAPE,
			description: undefined,
			cancelled: true,
		};
		expect(isLegacyCancelledNewsletter(techscapeWithEmptyDescription)).toBe(
			true,
		);
		expect(isLegacyCancelledNewsletter(techscapeWithNoDescription)).toBe(true);
	});
});
