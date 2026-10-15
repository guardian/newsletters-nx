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

	describe('add-section', () => {
		it('inserts a new section before the first section', () => {
			const initialSection = {
				title: 'News',
				newsletters: ['first-edition', 'breaking-news'],
			};
			const layout: Layout = {
				groups: [initialSection],
			};

			const state = makeStandLayoutState(layout);
			const adding = standLayoutReducer(state, {
				type: 'add-section',
				insert: { place: 'before', groupIndex: 0 },
			});

			expect(adding).toMatchObject({
				layout: {
					groups: [{ title: '', newsletters: [] }, initialSection],
				},
			});
		});

		it('inserts a new section when there are no sections', () => {
			const state = makeStandLayoutState({ groups: [] });
			const adding = standLayoutReducer(state, {
				type: 'add-section',
				insert: { place: 'before', groupIndex: 0 },
			});

			expect(adding.layout.groups).toEqual([{ title: '', newsletters: [] }]);
		});

		it('inserts a new section after the last section', () => {
			const initialSections = makeLayout().groups;
			const state = makeStandLayoutState({ groups: initialSections });
			const adding = standLayoutReducer(state, {
				type: 'add-section',
				insert: { place: 'after', groupIndex: initialSections.length - 1 },
			});

			expect(adding.layout.groups).toEqual([
				...initialSections,
				{ title: '', newsletters: [] },
			]);
		});

		describe('inserting new sections between sections', () => {
			const newsSection = { title: 'News', newsletters: ['a'] };
			const sportSection = { title: 'Sport', newsletters: ['b'] };
			const cultureSection = { title: 'Culture', newsletters: ['c'] };
			const blankSection = { title: '', newsletters: [] };

			it.each([
				{
					place: 'after',
					groupIndex: 0,
					expectedSections: [newsSection, blankSection, sportSection, cultureSection],
				},
				{
					place: 'before',
					groupIndex: 1,
					expectedSections: [newsSection, blankSection, sportSection, cultureSection],
				},
				{
					place: 'after',
					groupIndex: 1,
					expectedSections: [newsSection, sportSection, blankSection, cultureSection],
				},
				{
					place: 'before',
					groupIndex: 2,
					expectedSections: [newsSection, sportSection, blankSection, cultureSection],
				},
			] as const)(
				'inserts a new section between existing sections using $place groupIndex $groupIndex',
				({ place, groupIndex, expectedSections }) => {
					const initialSections = [newsSection, sportSection, cultureSection];
					const state = makeStandLayoutState({ groups: initialSections });
					const adding = standLayoutReducer(state, {
						type: 'add-section',
						insert: { place, groupIndex },
					});

					expect(adding.layout.groups).toEqual(expectedSections);
				},
			);
		});
	});
});
