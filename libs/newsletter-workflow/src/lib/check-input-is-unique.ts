import type {
	LaunchService,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import type { AsyncValidator } from '@newsletters-nx/state-machine';

export const checkFormInputIsUnique =
	(propertyKey: keyof NewsletterData): AsyncValidator<LaunchService> =>
	async (stepData, stepLayout, launchService) => {
		if (!launchService) {
			return 'no launch service';
		}

		const input = stepData.formData?.[propertyKey];
		const newsletterListResponse = await launchService.newsletterStorage.list();
		if (!newsletterListResponse.ok) {
			return 'failed to get list of current newsletters to check input is unique.';
		}
		const existingValues = newsletterListResponse.data.map(
			(newsletter) => newsletter[propertyKey],
		);

		// includes will work for strings, but not objects
		if (existingValues.includes(input as string)) {
			return `Please choose another value - the is already a newsletters with the ${propertyKey} "${
				input?.toString() ?? ''
			}".`;
		}
		return undefined;
	};
