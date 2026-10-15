import type { Layout } from '@newsletters-nx/newsletters-data-client';
import { describe, expect, it } from 'vitest';
import { moveNewsletter } from './modify-layout';

const layout: Layout = {
	groups: [
		{ title: 'One', newsletters: ['a', 'b', 'c'] },
		{ title: 'Two', newsletters: ['d'] },
	],
};

const newslettersIn = (result: Layout) =>
	result.groups.map((group) => group.newsletters);

describe('moveNewsletter', () => {
	it('moves a newsletter down within its group', () => {
		expect(newslettersIn(moveNewsletter(layout, 'a', 0, 2))).toEqual([
			['b', 'a', 'c'],
			['d'],
		]);
	});
	it('moves a newsletter to the end of its group', () => {
		expect(newslettersIn(moveNewsletter(layout, 'a', 0, 3))).toEqual([
			['b', 'c', 'a'],
			['d'],
		]);
	});
	it('moves a newsletter up within its group', () => {
		expect(newslettersIn(moveNewsletter(layout, 'c', 0, 0))).toEqual([
			['c', 'a', 'b'],
			['d'],
		]);
	});
	it('moves a newsletter into another group', () => {
		expect(newslettersIn(moveNewsletter(layout, 'b', 1, 0))).toEqual([
			['a', 'c'],
			['b', 'd'],
		]);
	});
	it('moves a newsletter into an empty group', () => {
		const withEmpty: Layout = {
			groups: [...layout.groups, { title: 'Empty', newsletters: [] }],
		};
		expect(newslettersIn(moveNewsletter(withEmpty, 'd', 2, 0))).toEqual([
			['a', 'b', 'c'],
			[],
			['d'],
		]);
	});
	it('returns the same layout when the newsletter is dropped next to itself', () => {
		expect(moveNewsletter(layout, 'b', 0, 1)).toBe(layout);
		expect(moveNewsletter(layout, 'b', 0, 2)).toBe(layout);
	});
	it('returns the same layout for an unknown newsletter or group', () => {
		expect(moveNewsletter(layout, 'x', 0, 0)).toBe(layout);
		expect(moveNewsletter(layout, 'a', 5, 0)).toBe(layout);
	});
});
