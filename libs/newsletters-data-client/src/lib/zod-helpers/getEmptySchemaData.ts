import type { z } from 'zod';
import { ZodBoolean, ZodDate, ZodEnum, ZodNumber, ZodString } from 'zod';
import type { FormDataRecord } from '../transformWizardData';
import { recursiveUnwrap } from './recursiveUnwrap';

/**
 * NOTE - ZodDates are defaulted to 'undefined'
 * not a problem for the current usage of this function
 * but may need to be revised.
 *
 * Enums start undefined by default so the user is forced to choose a value
 * rather than having the first item pre-selected.
 */
export const getEmptySchemaData = (
	schema: z.ZodObject<z.ZodRawShape>,
	unwrapOptionals = false,
	setEnumsToFirstValue = false,
	populateStringsWithMinLength = false,
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
			const initalString =
				populateStringsWithMinLength && zod.minLength
					? '*'.repeat(zod.minLength)
					: '';
			mod[key] = initalString;
		} else if (zod instanceof ZodEnum) {
			if (setEnumsToFirstValue) {
				const [firstOption] = zod.options as unknown[];
				if (typeof firstOption === 'string') {
					mod[key] = firstOption;
				}
			} else {
				mod[key] = undefined;
			}
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
