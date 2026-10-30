// Runs before every spec file (see `test.setupFiles` in vite.config.ts).
// Testing Library unmounts rendered components after each test by itself,
// because `test.globals` is enabled, so specs don't need to call `cleanup`.
import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import { scrollIntoView } from './test-utils/dom';

Object.defineProperty(Element.prototype, 'scrollIntoView', {
	configurable: true,
	writable: true,
	value: scrollIntoView,
});

beforeEach(() => {
	scrollIntoView.mockReset();
});
