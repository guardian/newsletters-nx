import type { ZodRawShape, ZodTypeAny } from 'zod';
import { ZodObject, ZodOptional } from 'zod';
import type { DraftNewsletterData } from './newsletter-data-type';
import { draftNewsletterDataSchema } from './newsletter-data-type';

export type FormDataRecord = Record<
	string,
	string | number | boolean | undefined | Date
>;

function buildObjectValue(
	fieldKey: string,
	objectSchema: ZodObject<ZodRawShape>,
	formData: FormDataRecord,
) {
	// if there are no values in the form data that are properties in the
	// nest object, return undefined rather than an empty object
	if (!Object.keys(formData).some((key) => key.startsWith(fieldKey))) {
		return undefined;
	}

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
	if (!parseResult.success) {
		console.warn(
			`buildObjectValue for ${fieldKey} failed:`,
			parseResult.error.issues.map((issue) => [
				issue.path.join(),
				issue.message,
			]),
		);
	}
	return parseResult.success ? parseResult.data : undefined;
}

const deepUnwrapOptionalObject = (
	field: ZodTypeAny,
): ZodObject<ZodRawShape> | undefined => {
	const recursiveUnwrap = (optional: ZodOptional<ZodTypeAny>): ZodTypeAny => {
		const unwrapped = optional.unwrap();
		if (unwrapped instanceof ZodOptional) {
			return recursiveUnwrap(unwrapped as ZodOptional<ZodTypeAny>);
		}
		return unwrapped;
	};

	if (field instanceof ZodObject) {
		return field;
	}

	if (field instanceof ZodOptional) {
		const deepUnwrapped = recursiveUnwrap(field as ZodOptional<ZodTypeAny>);
		return deepUnwrapped instanceof ZodObject ? deepUnwrapped : undefined;
	}

	return undefined;
};

/**
 * TO DO: support Date conversions
 * TO DO: support Arrays
 */
export const formDataToPartialNewsletter = (
	formData: FormDataRecord,
): DraftNewsletterData => {
	const output: Record<string, unknown> = {};

	for (const key in draftNewsletterDataSchema.shape) {
		const recordValue = formData[key];
		const fieldSchema =
			draftNewsletterDataSchema.shape[key as keyof DraftNewsletterData];

		const underlyingObjectSchema = deepUnwrapOptionalObject(fieldSchema);
		if (underlyingObjectSchema) {
			const objectValue = buildObjectValue(
				key,
				underlyingObjectSchema,
				formData,
			);
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

	const finalParseResult = draftNewsletterDataSchema.safeParse(output);
	if (!finalParseResult.success) {
		throw finalParseResult.error;
	}
	return finalParseResult.data;
};

function addDestructuredObjectValues(
	fieldKey: keyof DraftNewsletterData,
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

	for (const key in draftNewsletterDataSchema.shape) {
		const castkey = key as keyof DraftNewsletterData;
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
