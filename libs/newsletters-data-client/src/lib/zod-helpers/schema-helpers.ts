import { z } from 'zod';

export const nonEmptyString = () =>
	z.string().min(1, { message: 'Must not be empty' });

export const kebabCasedString = () =>
	z
		.string()
		.regex(
			/^[a-z]+(-[a-z]+)*$/,
			'Must be in kebab-case (only lower case words connected by dashes)',
		);

export const underscoreCasedString = () =>
	z
		.string()
		.regex(
			/^[a-zA-Z]+(_[a-zA-z]+)*$/,
			'Must contain only words(upper or lower case letters) connected by underscores',
		);


export const kebabOrUnderscoreCasedString = () =>
	z
		.string()
		.regex(
			/^[a-z]+(?:[-_][a-z]+)*$/,
			'Must be in lower case only, separated by dashes or underscores',
		);
