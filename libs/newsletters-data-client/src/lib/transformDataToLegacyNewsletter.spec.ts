import {
	TECHSCAPE_IN_NEW_FORMAT,
	VALID_TECHSCAPE,
} from '../fixtures/newsletter-fixtures';
import type { NewsletterData } from './schemas/newsletter-data-type';
import {
	TRANSFORM_ERROR_MESSAGE,
	transformDataToLegacyNewsletter,
} from './transformDataToLegacyNewsletter';

describe('transformNewToOld', () => {
	it('will transform new data to the legacy api format', () => {
		const output = transformDataToLegacyNewsletter(TECHSCAPE_IN_NEW_FORMAT);
		expect(output).toEqual(VALID_TECHSCAPE);
	});

	it('will throw an error if the input fails validation', () => {
		const dataWithEmptyName: NewsletterData = {
			...TECHSCAPE_IN_NEW_FORMAT,
			identityName: '',
		};

		const attemptToTransformInvalidData = () => {
			transformDataToLegacyNewsletter(dataWithEmptyName);
		};

		expect(attemptToTransformInvalidData).toThrowError(
			TRANSFORM_ERROR_MESSAGE.input,
		);
	});

	it('will convert status correctly', () => {
		const cancelledTechscape: NewsletterData = {
			...TECHSCAPE_IN_NEW_FORMAT,
			status: 'cancelled',
		};
		const pausedTechscape: NewsletterData = {
			...TECHSCAPE_IN_NEW_FORMAT,
			status: 'paused',
		};
		const pendingTechscape: NewsletterData = {
			...TECHSCAPE_IN_NEW_FORMAT,
			status: 'pending',
		};

		const cancelledNewsletter =
			transformDataToLegacyNewsletter(cancelledTechscape);
		expect(cancelledNewsletter.cancelled).toBe(true);
		expect(cancelledNewsletter.paused).toBe(false);

		const pausedNewsletter = transformDataToLegacyNewsletter(pausedTechscape);
		expect(pausedNewsletter.cancelled).toBe(false);
		expect(pausedNewsletter.paused).toBe(true);

		const pendingNewsletter = transformDataToLegacyNewsletter(pendingTechscape);
		expect(pendingNewsletter.cancelled).toBe(false);
		expect(pendingNewsletter.paused).toBe(true);
	});
});
