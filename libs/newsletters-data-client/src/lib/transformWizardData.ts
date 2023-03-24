import type { ZodRawShape } from 'zod';
import { ZodObject, ZodOptional } from 'zod';
import type {
	DraftNewsletterData,
	NewsletterData,
} from './newsletter-data-type';
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

/**
 * TO DO: support Date conversions
 * TO DO: support Arrays
 */
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
		} else {
			console.warn('WRONG VALUE', key, recordValue);
			console.log(parsedRecordValue.error.issues.map((i) => i.message));
		}
	}

	const finalParseResult = newsletterDataSchema.partial().safeParse(output);
	if (!finalParseResult.success) {
		throw finalParseResult.error;
	}
	return finalParseResult.data;
};

function addDestructuredObjectValues(
	fieldKey: keyof NewsletterData,
	source: DraftNewsletterData,
	target: FormDataRecord,
) {
	const nestedObject = source[fieldKey];
	if (typeof nestedObject !== 'object') {
		return;
	}
	if (Array.isArray(nestedObject)) {
		return;
	}

	Object.entries(nestedObject).forEach(([subKey, value]) => {
		const combinedKey = [fieldKey, subKey].join('.');
		target[combinedKey] = value;
	});
}

export const partialNewsletterToFormData = (
	partialNewsletter: DraftNewsletterData,
): FormDataRecord => {
	const output: FormDataRecord = {};

	for (const key in newsletterDataSchema.shape) {
		const castkey = key as keyof NewsletterData;
		const valueOnPartial = partialNewsletter[castkey];

		switch (typeof valueOnPartial) {
			case 'string':
			case 'number':
			case 'boolean':
			case 'bigint':
				output[castkey] = valueOnPartial;
				break;
			case 'object': {
				if (Array.isArray(valueOnPartial)) {
					console.log('NOT SUPPORTING ARRAYS');
				} else {
					addDestructuredObjectValues(castkey, partialNewsletter, output);
				}
				break;
			}

			case 'symbol':
			case 'undefined':
			case 'function':
				break;
		}
	}

	return output;
};
