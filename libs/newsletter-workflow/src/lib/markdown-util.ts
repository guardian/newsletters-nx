import type { ZodObject, ZodRawShape } from 'zod';
import { getValidationWarnings } from '@newsletters-nx/newsletters-data-client';

export const isStringArray = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every((item) => typeof item === 'string');

export const getValidationWarningsAsMarkDownLines = (
	data: Partial<Record<string, unknown>>,
	schema: ZodObject<ZodRawShape>,
): string[] => {
	const validationWarnings = getValidationWarnings(data, schema);

	const lines = Object.entries(validationWarnings).map(
		([key, warning]) => `**${key}**:  ${warning ?? ''}`,
	);
	return lines;
};

export const appendListToMarkdown = (
	existingContent: string,
	lines: string[],
): string => {
	lines.forEach((line) => {
		existingContent += `\n - ${line}`;
	});
	return existingContent;
};
