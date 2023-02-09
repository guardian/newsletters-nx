import {
	TECHSCAPE_IN_NEW_FORMAT,
	VALID_TECHSCAPE,
} from '../fixtures/newsletter-fixtures';
import type { NewsletterData } from './newsletter-data-type';
import { TRANSFORM_ERROR_MESSAGE, transformNewToOld } from './transform';

describe('transformNewToOld', () => {
	it('will transform new data to the legacy api format', () => {
		const output = transformNewToOld(TECHSCAPE_IN_NEW_FORMAT);
		expect(output).toEqual(VALID_TECHSCAPE);
	});

	it('will throw an error if the input fails validation', () => {
		const dataWithEmptyName: NewsletterData = {
			...TECHSCAPE_IN_NEW_FORMAT,
			identityName: '',
		};

		const attemptToTransformInvalidData = () => {
			transformNewToOld(dataWithEmptyName);
		};

		expect(attemptToTransformInvalidData).toThrowError(
			TRANSFORM_ERROR_MESSAGE.input,
		);
	});
});
