import type { z } from 'zod';
import { ZodBoolean, ZodEnum, ZodNumber, ZodString } from 'zod';
import type { WizardFormData } from './types';

export const getEmptySchemaData = (
	schema: z.ZodObject<z.ZodRawShape>,
): WizardFormData | undefined => {
	return Object.keys(schema.shape).reduce<WizardFormData>((formData, key) => {
		const zod = schema.shape[key];

		if (!zod) {
			return formData;
		}

		const mod: WizardFormData = {};

		if (zod instanceof ZodString) {
			mod[key] = '';
		} else if (zod instanceof ZodEnum) {
			const [firstOption] = zod.options as string[];
			mod[key] = firstOption;
		} else if (zod instanceof ZodNumber) {
			mod[key] = 0;
		} else if (zod instanceof ZodBoolean) {
			mod[key] = false;
		}

		return {
			...formData,
			...mod,
		};
	}, {});
};
