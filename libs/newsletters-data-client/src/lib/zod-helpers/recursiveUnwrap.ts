import type { ZodTypeAny } from 'zod';
import { ZodOptional } from 'zod';

export const recursiveUnwrap = (field: ZodTypeAny): ZodTypeAny => {
	if (!(field instanceof ZodOptional)) {
		return field;
	}
	const unwrapped = field.unwrap() as ZodTypeAny;
	if (unwrapped instanceof ZodOptional) {
		return recursiveUnwrap(unwrapped as ZodOptional<ZodTypeAny>);
	}
	return unwrapped;
};
