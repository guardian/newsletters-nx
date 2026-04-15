import type { ZodType } from 'zod';
import { ZodOptional } from 'zod';

export const recursiveUnwrap = (field: ZodType): ZodType => {
	if (!(field instanceof ZodOptional)) {
		return field;
	}
	const unwrapped = field.unwrap() as ZodType;
	if (unwrapped instanceof ZodOptional) {
		return recursiveUnwrap(unwrapped as ZodOptional<ZodType>);
	}
	return unwrapped;
};
