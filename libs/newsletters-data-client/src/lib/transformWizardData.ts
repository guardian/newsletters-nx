import type { NewsletterData } from './newsletter-data-type';
import { newsletterDataSchema } from './newsletter-data-type';

type FormData = Record<string, string | number | boolean | undefined | Date>;

export const formDataToPartialNewsletter = (
	formData: FormData,
): Partial<NewsletterData> => {
	const output: Partial<NewsletterData> = {};

	for (const key in newsletterDataSchema.shape) {
		console.log(key, newsletterDataSchema.shape[key as keyof NewsletterData]);
	}

	// Object.entries(formData).forEach(([key, value]) => {});

	return output;
};

export const partialNewsletterToFormData = (
	partialNewsletter: Partial<NewsletterData>,
): FormData => {
	const output: FormData = {};

	Object.entries(partialNewsletter).forEach(([key, value]) => {
		console.log(key, value);
	});

	return output;
};
