import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from './useIsMobile';

type Listener = () => void;

const mockMatchMedia = (initialMatches: boolean) => {
	const listeners = new Set<Listener>();
	const mql = {
		matches: initialMatches,
		addEventListener: vi.fn((_: string, l: Listener) => listeners.add(l)),
		removeEventListener: vi.fn((_: string, l: Listener) => listeners.delete(l)),
	};
	const matchMedia = vi.fn(() => mql);
	vi.stubGlobal('matchMedia', matchMedia);
	return {
		mql,
		matchMedia,
		listeners,
		change: (matches: boolean) => {
			mql.matches = matches;
			listeners.forEach((l) => l());
		},
	};
};

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe('useIsMobile', () => {
	it.each([true, false])('returns the initial match (%s)', (matches) => {
		const { matchMedia } = mockMatchMedia(matches);
		const { result } = renderHook(() => useIsMobile());

		expect(result.current).toBe(matches);
		expect(matchMedia).toHaveBeenCalledWith(
			expect.stringMatching(/^\(width < \d+px\)$/),
		);
	});

	it('updates when the media query changes', () => {
		const { change } = mockMatchMedia(false);
		const { result } = renderHook(() => useIsMobile());

		act(() => change(true));
		expect(result.current).toBe(true);
		act(() => change(false));
		expect(result.current).toBe(false);
	});

	it('removes its listener on unmount', () => {
		const { mql, listeners } = mockMatchMedia(false);
		const { unmount } = renderHook(() => useIsMobile());
		expect(listeners.size).toBe(1);

		unmount();
		expect(mql.removeEventListener).toHaveBeenCalledTimes(1);
		expect(listeners.size).toBe(0);
	});

	it('returns false when matchMedia is unavailable', () => {
		vi.stubGlobal('matchMedia', undefined);
		const { result } = renderHook(() => useIsMobile());

		expect(result.current).toBe(false);
	});
});
