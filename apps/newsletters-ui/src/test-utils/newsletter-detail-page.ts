import { screen, within } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Queries scoped to the detail page panel whose (level 3) heading is `name`.
 */
export const panel = (name: string) => {
	const section = screen
		.getByRole('heading', { name, level: 3 })
		.closest('section');
	if (!section) {
		throw new Error(`Expected the ${name} panel to exist`);
	}
	return within(section);
};

/**
 * The text shown for a read-only detail field, found by its label (see
 * `Field` in `NewsletterDetailFields`). Decorative (aria-hidden) content such
 * as icons is ignored.
 */
export const valueFor = (label: string): string | null => {
	const value = screen
		.getByRole('group', { name: label })
		.querySelector(':scope > dd');
	if (!value) {
		throw new Error(`Expected the "${label}" field to have a value`);
	}
	// Strip the aria-hidden content from a copy, not from the page itself
	const copy = value.cloneNode(true) as Element;
	copy
		.querySelectorAll('[aria-hidden="true"]')
		.forEach((element) => element.remove());
	return copy.textContent;
};

/** A response from `/api/signup-path-validation`. */
export const signupPathCheckResponse = (valid: boolean) =>
	({
		ok: true,
		json: () => Promise.resolve({ ok: true, data: { valid } }),
	}) as Response;

/** A `/api/signup-path-validation` request that failed, e.g. a 502. */
export const failedSignupPathCheckResponse = (status = 502) =>
	({ ok: false, status }) as Response;

/**
 * Replaces `fetch` so that every sign-up path is checked as `valid`. Returns
 * the mock so tests can change the response.
 */
export const mockSignupPathCheck = (valid = true) => {
	const fetchMock = vi.fn().mockResolvedValue(signupPathCheckResponse(valid));
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
};
