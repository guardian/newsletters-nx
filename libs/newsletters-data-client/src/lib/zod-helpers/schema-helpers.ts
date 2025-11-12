import { z } from 'zod';

export const nonEmptyString = () =>
	z.string().min(1, { message: 'Must not be empty' });

export const underscoreCasedString = () =>
	z
		.string()
		.regex(
			/^[a-zA-Z0-9]+(_[a-zA-Z0-9]+)*$/,
			'Must contain letters or numbers, connected by underscores',
		);

export const kebabOrUnderscoreCasedString = () =>
	z
		.string()
		.regex(
			/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
			'Must contain numbers or lower-case letters only, separated by dashes or underscores',
		);

export const urlPathString = (customValidationMessage?: string) =>
	z
		.string()
		.regex(
			/^(?:[/][a-zA-Z0-9-]*)+$/,
			customValidationMessage ??
				'Must start with a slash then sets of only letters, dashes or numbers, separated by slashes',
		);

/**
 * This regex doesn't validate perfectly - it allows :
 *  - strings that contain no slashes eg "path-should-have-at-least-two-sets"
 *  - repeated slashes e.g."should-be-at-least//one-letter-in-set"
 *  - trailing slashes e.g. "should-end-with-a-set/"
 *
 *  This is so it's possible to type a value (starting from empty)
 *  into a text field that will not allow edits that break
 *  the schema (EG in the SimpleForm component)
 */
export const tagPathString = (customValidationMessage?: string) =>
	z
		.string()
		.regex(
			/^[a-z0-9-]+(?:[/][a-z0-9-]*)*$/,
			customValidationMessage ??
				'Must be two or more sets of lower-case letters, dashes or numbers with each set separated by slashes',
		);
