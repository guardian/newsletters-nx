import type { ZodRawShape, ZodTypeAny } from 'zod';
import { ZodObject, ZodOptional } from 'zod';
import type { DraftNewsletterData } from './newsletter-data-type';
import { draftNewsletterDataSchema } from './newsletter-data-type';
import { recursiveUnwrap } from './zod-helpers';

export type PrimitiveRecord = Partial<
	Record<string, string | number | boolean>
>;
type SupportedValue =
	| string
	| number
	| boolean
	| undefined
	| Date
	| string[]
	| PrimitiveRecord
	| DraftNewsletterData;
export type FormDataRecord = Record<string, SupportedValue>;

/**
 * Finds all key/value pairs on the **formData** where the key starts with
 * the given **fieldKey** and builds a record of using those key/value pairs,
 * but with the prefix removed from the key e.g. for the fieldKey "person"
 *
 * `{"person.name":"Bob", "person.age":32, time:204}` => `{name:"Bob", age:32}`
 *
 * Returns the new record, if it matches the **objectSchema**, if not returns
 * undefined.
 *
 * If there are no keys on the **formData** that start with the prefix
 * returns undefined rather than an empty object
 */
const buildObjectValue = (
	fieldKey: keyof DraftNewsletterData,
	objectSchema: ZodObject<ZodRawShape>,
	formData: FormDataRecord,
): Record<string, unknown> | undefined => {
	if (!Object.keys(formData).some((key) => key.startsWith(`${fieldKey}.`))) {
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
	return parseResult.success ? parseResult.data : undefined;
};

/**
 * Takes any Zod schema, if it is an optional, unwraps the schema recursively
 * to get to the underlying schema.
 *
 * If the original schema or underlying is a ZodObject, returns that ZodObject,
 * otherwise returns undefined.
 */
const getObjectSchemaIfObject = (
	field: ZodTypeAny,
): ZodObject<ZodRawShape> | undefined => {
	if (field instanceof ZodObject) {
		return field;
	}

	if (field instanceof ZodOptional) {
		const deepUnwrapped = recursiveUnwrap(field as ZodOptional<ZodTypeAny>);
		return deepUnwrapped instanceof ZodObject ? deepUnwrapped : undefined;
	}

	return undefined;
};

export const formDataToDraftNewsletterData = (
	formData: FormDataRecord,
): DraftNewsletterData => {
	const output: Record<string, unknown> = {};

	for (const key in draftNewsletterDataSchema.shape) {
		const castKey = key as keyof DraftNewsletterData;
		const recordValue = formData[castKey];
		const fieldSchema = draftNewsletterDataSchema.shape[castKey];
		const objectSchema = getObjectSchemaIfObject(fieldSchema);
		if (objectSchema) {
			const objectValue = buildObjectValue(castKey, objectSchema, formData);
			if (objectValue) {
				output[castKey] = objectValue;
			}
			continue;
		}

		if (typeof recordValue === 'undefined') {
			continue;
		}

		// If the fieldSchema is z.coerce.date() and the recordValue is a string,
		// the safeParse function will attempt to parse the string to a Date object.
		// If recordValue is a Date, safeParse clones that Date.
		// IE no special handling is need for Dates values being stored as Dates or
		// having been stringified.
		const parsedRecordValue = fieldSchema.safeParse(recordValue);
		if (parsedRecordValue.success) {
			output[castKey] = parsedRecordValue.data;
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
		target[combinedKey] = value as SupportedValue;
	});
}

export const draftNewsletterDataToFormData = (
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
				if (valueOnPartial instanceof Date) {
					output[castkey] = new Date(valueOnPartial.valueOf());
				} else if (
					Array.isArray(valueOnPartial) &&
					valueOnPartial.every((item) => typeof item === 'string')
				) {
					output[castkey] = [...valueOnPartial];
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
