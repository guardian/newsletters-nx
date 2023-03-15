import type { ZodRawShape } from 'zod';
import { ZodObject } from 'zod';
import type { NewsletterData } from './newsletter-data-type';
import { newsletterDataSchema } from './newsletter-data-type';

export type FormDataRecord = Record<
	string,
	string | number | boolean | undefined | Date
>;

function buildObjectValue<T extends ZodRawShape>(
	fieldKey: string,
	objectSchema: ZodObject<T>,
	formData: FormDataRecord,
) {
	const output: Record<string, unknown> = {};

	for (const subKey in objectSchema.shape) {
		const combinedKey = [fieldKey, subKey].join('.');
		const recordValue = formData[combinedKey];
		if (typeof recordValue === 'undefined') {
			continue;
		}
		output[subKey] = recordValue;
	}

	const parseResult = objectSchema.safeParse(output);
	return parseResult.success ? parseResult.data : undefined;
}

export const formDataToPartialNewsletter = (
	formData: FormDataRecord,
): Partial<NewsletterData> => {
	const output: Record<string, unknown> = {};

	for (const key in newsletterDataSchema.shape) {
		const recordValue = formData[key];
		const fieldSchema = newsletterDataSchema.shape[key as keyof NewsletterData];

		if (fieldSchema instanceof ZodObject) {
			const objectValue = buildObjectValue(key, fieldSchema, formData);
			if (objectValue) {
				output[key] = objectValue;
			}
			continue;
		}

		if (typeof recordValue === 'undefined') {
			continue;
		}
		const parsedRecordValue = fieldSchema.safeParse(recordValue);
		if (parsedRecordValue.success) {
			output[key] = parsedRecordValue.data;
		}
	}

	const finalParseResult = newsletterDataSchema.partial().safeParse(output);
	if (!finalParseResult.success) {
		throw finalParseResult.error;
	}
	return finalParseResult.data;
};

export const partialNewsletterToFormData = (
	partialNewsletter: Partial<NewsletterData>,
): FormDataRecord => {
	const output: FormDataRecord = {};

	Object.entries(partialNewsletter).forEach(([key, value]) => {
		console.log(key, value);
	});

	return output;
};
