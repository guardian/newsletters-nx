import type { ZodObject, ZodRawShape } from 'zod';

export const getValidationWarnings = (
	data: Partial<Record<string, unknown>>,
	schema: ZodObject<ZodRawShape>,
): Partial<Record<string, string>> => {
	const parseResult = schema.safeParse(data);
	const validationWarnings: Partial<Record<string, string>> = {};

	if (!parseResult.success) {
		parseResult.error.issues.forEach((issue) => {
			const { message, path, code } = issue;
			const key = typeof path[0] === 'string' ? path[0] : undefined;

			if (key) {
				validationWarnings[key] = message || code;
			}
		});
	}
	return validationWarnings;
};
