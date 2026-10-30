import { screen, within } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * jsdom doesn't implement `Element.prototype.scrollIntoView`, so
 * `src/test-setup.ts` installs this mock for every test and resets it
 * beforehand. Assert on it directly, and use `mock.contexts` to see which
 * element was scrolled.
 */
export const scrollIntoView = vi.fn();

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
