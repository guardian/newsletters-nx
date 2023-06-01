import type { z } from 'zod';
import {
	ZodArray,
	ZodBoolean,
	ZodDate,
	ZodEnum,
	ZodNumber,
	ZodOptional,
	ZodString,
} from 'zod';
import type { FormDataRecord } from '../transformWizardData';
import { recursiveUnwrap } from './recursiveUnwrap';

/**
 * NOTE - ZodDates are defaulted to 'undefined'
 * not a problem for the current usage of this function
 * but may need to be revised.
 *
 * Enums start undefined so the user is forced to choose a value
 * rather than having the first item pre-selected. Could add and
 * extra argument to default enum to the first item when required.
 */
export const getEmptySchemaData = (
	schema: z.ZodObject<z.ZodRawShape>,
	unwrapOptionals = false,
): FormDataRecord | undefined => {
	return Object.keys(schema.shape).reduce<FormDataRecord>((formData, key) => {
		const zodMaybeOptional = schema.shape[key];

		if (!zodMaybeOptional) {
			return formData;
		}
		const zod = unwrapOptionals
			? recursiveUnwrap(zodMaybeOptional)
			: zodMaybeOptional;
		const mod: FormDataRecord = {};

		if (zod instanceof ZodString) {
			mod[key] = '';
		} else if (zod instanceof ZodEnum) {
			mod[key] = undefined;
		} else if (zod instanceof ZodNumber) {
			mod[key] = 0;
		} else if (zod instanceof ZodBoolean) {
			mod[key] = false;
		} else if (zod instanceof ZodDate) {
			mod[key] = undefined;
		} else if (zod instanceof ZodOptional) {
			if (zod.unwrap() instanceof ZodArray) {
				mod[key] = [];
			}
		}

		return {
			...formData,
			...mod,
		};
	}, {});
};
