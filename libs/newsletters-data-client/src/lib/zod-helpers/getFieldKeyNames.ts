import type { ZodType } from 'zod';
import { ZodObject } from 'zod';
import { recursiveUnwrap } from './recursiveUnwrap';

export const getFieldKeyNames = (schema: ZodType): undefined | string[] => {
	const unwrappedSchema = recursiveUnwrap(schema);
	if (!(unwrappedSchema instanceof ZodObject)) {
		return undefined;
	}
	const shape = unwrappedSchema.shape as Record<string, unknown>;
	return Object.keys(shape);
};
