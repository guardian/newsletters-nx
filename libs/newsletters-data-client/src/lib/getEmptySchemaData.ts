import type { z, ZodTypeAny } from 'zod';
import {
	ZodBoolean,
	ZodDate,
	ZodEnum,
	ZodNumber,
	ZodOptional,
	ZodString,
} from 'zod';
import type { FormDataRecord } from './transformWizardData';

//TO DO - deduplicate the versions of these functions in other libraries

const recursiveUnwrap = (field: ZodTypeAny): ZodTypeAny => {
	if (!(field instanceof ZodOptional)) {
		return field;
	}
	const unwrapped = field.unwrap() as ZodTypeAny;
	if (unwrapped instanceof ZodOptional) {
		return recursiveUnwrap(unwrapped as ZodOptional<ZodTypeAny>);
	}
	return unwrapped;
};

/**
 * NOTE - ZodDates are defaulted to 'undefined'
 * not a problem for the current usage of this function
 * but may need to be revised.
 */
export const getEmptySchemaData = (
	schema: z.ZodObject<z.ZodRawShape>,
): FormDataRecord | undefined => {
	return Object.keys(schema.shape).reduce<FormDataRecord>((formData, key) => {
		const zodMaybeOptional = schema.shape[key];

		if (!zodMaybeOptional) {
			return formData;
		}
		const zod = recursiveUnwrap(zodMaybeOptional);
		const mod: FormDataRecord = {};

		if (zod instanceof ZodString) {
			mod[key] = '';
		} else if (zod instanceof ZodEnum) {
			const [firstOption] = zod.options as string[];
			mod[key] = firstOption;
		} else if (zod instanceof ZodNumber) {
			mod[key] = 0;
		} else if (zod instanceof ZodBoolean) {
			mod[key] = false;
		} else if (zod instanceof ZodDate) {
			mod[key] = undefined;
		}

		return {
			...formData,
			...mod,
		};
	}, {});
};
