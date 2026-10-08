import { until } from '@guardian/stand/utils';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toMediaQuery, useIsMobile } from './useIsMobile';

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

describe('toMediaQuery', () => {
	it('turns the Stand md breakpoint into a bare media condition', () => {
		// Fails if the shape of `until.md` changes.
		expect(toMediaQuery(until.md)).toMatch(/^\(max-width:\s*[\d.]+px\)$/);
	});

	it('leaves a bare condition unchanged', () => {
		expect(toMediaQuery('(max-width: 10px)')).toBe('(max-width: 10px)');
	});
});

describe('useIsMobile', () => {
	it.each([true, false])('returns the initial match (%s)', (matches) => {
		const { matchMedia } = mockMatchMedia(matches);
		const { result } = renderHook(() => useIsMobile());

		expect(result.current).toBe(matches);
		expect(matchMedia).toHaveBeenCalledWith(toMediaQuery(until.md));
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
