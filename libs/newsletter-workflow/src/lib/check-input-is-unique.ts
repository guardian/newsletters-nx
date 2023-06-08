import type {
	LaunchService,
	NewsletterData,
	SupportedValue,
} from '@newsletters-nx/newsletters-data-client';
import type { AsyncValidator } from '@newsletters-nx/state-machine';

const getUndefinedOrNotUniqueProblem = (
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
		return `There is already a newsletter with the ${propertyKey} "${input}".`;
	}

	return undefined;
};

/**
 * Create an AsyncValidator<LaunchService> that returns an error string
 * if there are any existing launched newsletters with a value for any of the
 * given propertyKey that is the same as the value for that key on the formData.
 */
export const checkFormDataValuesAreUnique =
	(propertyKeys: Array<keyof NewsletterData>): AsyncValidator<LaunchService> =>
	async (stepData, stepLayout, launchService) => {
		if (!launchService) {
			return { message: 'no launch service' };
		}
		const newsletterListResponse = await launchService.newsletterStorage.list();
		if (!newsletterListResponse.ok) {
			return {
				message:
					'failed to get list of current newsletters to check input is unique.',
			};
		}

		const problemList: string[] = [];

		propertyKeys.forEach((propertyKey) => {
			const problem = getUndefinedOrNotUniqueProblem(
				stepData.formData?.[propertyKey],
				propertyKey,
				newsletterListResponse.data,
			);

			if (problem) {
				problemList.push(problem);
			}
		});

		if (problemList.length > 0) {
			return {
				message: `There are ${problemList.length} values that need to be unique and non-empty:`,
				details: { problemList },
			};
		}

		return undefined;
	};
