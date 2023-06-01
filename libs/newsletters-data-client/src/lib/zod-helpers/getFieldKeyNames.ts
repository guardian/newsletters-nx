import type { ZodTypeAny } from 'zod';
import { ZodObject } from 'zod';
import { recursiveUnwrap } from './recursiveUnwrap';

export const getFieldKeyNames = (schema: ZodTypeAny): undefined | string[] => {
	const unwrappedSchema = recursiveUnwrap(schema);
	if (!(unwrappedSchema instanceof ZodObject)) {
		return undefined;
	}
	const shape = unwrappedSchema.shape as Record<string, unknown>;
	return Object.keys(shape);
};
