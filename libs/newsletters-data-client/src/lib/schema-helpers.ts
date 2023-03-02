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
			'Must contain only letters and underscores',
		);
