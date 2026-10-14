import type { Layout } from '@newsletters-nx/newsletters-data-client';
import { describe, expect, it, vi } from 'vitest';
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
	it('moves a newsletter within its section only', () => {
		const state = standLayoutReducer(makeStandLayoutState(makeLayout()), {
			type: 'move-newsletter',
			newsletterId: 'a',
			toGroupIndex: 0,
			toIndex: 3,
		});
		expect(state.layout.groups[0]?.newsletters).toEqual(['b', 'c', 'a']);
		expect(state.layout.groups[1]?.newsletters).toEqual(['d']);
		expect(state.original.groups[0]?.newsletters).toEqual(['a', 'b', 'c']);
	});
	it('ignores moves while an update is in progress', () => {
		const initial = {
			...makeStandLayoutState(makeLayout()),
			updateInProgress: true,
		};
		const state = standLayoutReducer(initial, {
			type: 'move-newsletter',
			newsletterId: 'a',
			toGroupIndex: 0,
			toIndex: 3,
		});
		expect(state).toBe(initial);
	});
	it('moves a newsletter into another section', () => {
		const state = standLayoutReducer(makeStandLayoutState(makeLayout()), {
			type: 'move-newsletter',
			newsletterId: 'b',
			toGroupIndex: 1,
			toIndex: 1,
		});
		expect(state.layout.groups[0]?.newsletters).toEqual(['a', 'c']);
		expect(state.layout.groups[1]?.newsletters).toEqual(['d', 'b']);
	});
	it('leaves the state unchanged when a move would not change the order', () => {
		const initial = makeStandLayoutState(makeLayout());
		const state = standLayoutReducer(initial, {
			type: 'move-newsletter',
			newsletterId: 'a',
			toGroupIndex: 0,
			toIndex: 1,
		});
		expect(state).toBe(initial);
	});
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
	it('treats an invalid group index as no change', () => {
		const initial = makeStandLayoutState(makeLayout());
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const state = standLayoutReducer(initial, {
			type: 'remove-newsletter',
			groupIndex: 99,
			newsletterIndex: 0,
		});
		expect(state.layout).toBe(state.original);
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
	it('appends a newsletter to the bottom of the given section', () => {
		const state = standLayoutReducer(makeStandLayoutState(makeLayout()), {
			type: 'append-newsletter',
			groupIndex: 1,
			newsletterId: 'x',
		});
		expect(state.layout.groups[1]?.newsletters).toEqual(['d', 'x']);
		expect(state.layout.groups[0]?.newsletters).toEqual(['a', 'b', 'c']);
		expect(state.original).toEqual(makeLayout());
	});
	it('does not append a newsletter that is already in a section', () => {
		const initial = makeStandLayoutState(makeLayout());
		const state = standLayoutReducer(initial, {
			type: 'append-newsletter',
			groupIndex: 1,
			newsletterId: 'a',
		});
		expect(state).toBe(initial);
	});
});
