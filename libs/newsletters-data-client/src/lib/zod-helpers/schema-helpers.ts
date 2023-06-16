import { z } from 'zod';

export const nonEmptyString = () =>
	z.string().min(1, { message: 'Must not be empty' });

export const underscoreCasedString = () =>
	z
		.string()
		.regex(
			/^[a-zA-Z0-9]+(_[a-zA-z0-9]+)*$/,
			'Must contain letters or numbers, connected by underscores',
		);


export const kebabOrUnderscoreCasedString = () =>
	z
		.string()
		.regex(
			/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
			'Must numbers or lower-case letters only, separated by dashes or underscores',
		);
