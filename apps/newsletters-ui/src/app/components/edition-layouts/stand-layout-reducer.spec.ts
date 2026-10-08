import type { Layout } from '@newsletters-nx/newsletters-data-client';
import { describe, expect, it } from 'vitest';
import {
	makeStandLayoutState,
	standLayoutReducer,
} from './stand-layout-reducer';

const makeLayout = (): Layout => ({
	groups: [
		{ title: 'News', newsletters: ['a', 'b', 'c'] },
		{ title: 'Sport', newsletters: ['d'] },
	],
});
describe('standLayoutReducer', () => {
	it('removes the newsletter from the given section only', () => {
		const state = standLayoutReducer(makeStandLayoutState(makeLayout()), {
			type: 'remove-newsletter',
			groupIndex: 0,
			newsletterIndex: 1,
		});
		expect(state.layout.groups[0]?.newsletters).toEqual(['a', 'c']);
		expect(state.layout.groups[1]?.newsletters).toEqual(['d']);
	});
	it('does not mutate the original', () => {
		const initial = makeStandLayoutState(makeLayout());
		const snapshot = structuredClone(initial.original);
		const state = standLayoutReducer(initial, {
			type: 'remove-newsletter',
			groupIndex: 0,
			newsletterIndex: 0,
		});
		expect(state.original).toEqual(snapshot);
		expect(initial.layout).toEqual(snapshot);
		expect(state.layout).not.toBe(state.original);
	});
	it('cancel restores the original', () => {
		const removed = standLayoutReducer(makeStandLayoutState(makeLayout()), {
			type: 'remove-newsletter',
			groupIndex: 0,
			newsletterIndex: 0,
		});
		const cancelled = standLayoutReducer(removed, { type: 'cancel' });
		expect(cancelled.layout).toEqual(makeLayout());
	});
	it('ignores edits while an update is in progress', () => {
		const pending = standLayoutReducer(makeStandLayoutState(makeLayout()), {
			type: 'set-pending',
		});
		expect(pending.updateInProgress).toBe(true);
		const after = standLayoutReducer(pending, {
			type: 'remove-newsletter',
			groupIndex: 0,
			newsletterIndex: 0,
		});
		expect(after).toBe(pending);
	});
	it('records success and failure feedback', () => {
		const pending = standLayoutReducer(makeStandLayoutState(makeLayout()), {
			type: 'set-pending',
		});
		expect(
			standLayoutReducer(pending, {
				type: 'handle-server-response',
				success: true,
			}),
		).toMatchObject({ updateInProgress: false, feedback: 'success' });
		expect(
			standLayoutReducer(pending, {
				type: 'handle-server-response',
				success: false,
			}),
		).toMatchObject({ updateInProgress: false, feedback: 'failure' });
	});
});
