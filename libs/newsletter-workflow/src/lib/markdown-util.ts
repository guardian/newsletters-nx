import type { ZodIssue } from 'zod';

export const isStringArray = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every((item) => typeof item === 'string');

export const zodIssueToMarkdown = (issues: ZodIssue[]): string[] => {
	const lines = issues.map(
		(issue) => `**${issue.path.join()}**:  *${issue.message}*`,
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
