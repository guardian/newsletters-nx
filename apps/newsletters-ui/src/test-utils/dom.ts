import { vi } from 'vitest';

/**
 * jsdom doesn't implement `Element.prototype.scrollIntoView`, so
 * `src/test-setup.ts` installs this mock for every test and resets it
 * beforehand. Assert on it directly, and use `mock.contexts` to see which
 * element was scrolled.
 */
export const scrollIntoView = vi.fn();
