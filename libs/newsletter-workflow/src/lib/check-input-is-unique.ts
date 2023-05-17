import type {
	LaunchService,
	NewsletterData,
	SupportedValue,
} from '@newsletters-nx/newsletters-data-client';
import type { AsyncValidator } from '@newsletters-nx/state-machine';

const checkValue = (
	input: SupportedValue,
	propertyKey: keyof NewsletterData,
	existingNewsletters: NewsletterData[],
): string | undefined => {
	if (typeof input === 'undefined') {
		return `Please provide enter value for "${propertyKey}".`;
	}

	if (typeof input !== 'string' && typeof input !== 'number') {
		console.warn(
			`ran checkFormInputIsUniqueStringOrUniqueNumber for non-string, non-number value of ${propertyKey}.`,
			{ value: input },
		);
		return undefined;
	}

	const duplicateExists = existingNewsletters.some(
		(newsletter) => newsletter[propertyKey] === input,
	);

	if (duplicateExists) {
		return `Please choose another value - the is already a newsletters with the ${propertyKey} "${input}".`;
	}

	return undefined;
};

export const checkFormInputIsUniqueStringOrUniqueNumber =
	(propertyKeys: Array<keyof NewsletterData>): AsyncValidator<LaunchService> =>
	async (stepData, stepLayout, launchService) => {
		if (!launchService) {
			return 'no launch service';
		}
		const newsletterListResponse = await launchService.newsletterStorage.list();
		if (!newsletterListResponse.ok) {
			return 'failed to get list of current newsletters to check input is unique.';
		}

		const checkResults: string[] = [];

		propertyKeys.forEach((propertyKey) => {
			const result = checkValue(
				stepData.formData?.[propertyKey],
				propertyKey,
				newsletterListResponse.data,
			);

			if (result) {
				checkResults.push(result);
			}
		});

		if (checkResults.length > 0) {
			return checkResults.join('; ');
		}

		return undefined;
	};
