import type { z } from 'zod';
import { ZodBoolean, ZodDate, ZodEnum, ZodNumber, ZodString } from 'zod';
import type { FormDataRecord } from '../transformWizardData';
import { recursiveUnwrap } from './recursiveUnwrap';

/**
 * NOTE - ZodDates are defaulted to 'undefined'
 * not a problem for the current usage of this function
 * but may need to be revised.
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
