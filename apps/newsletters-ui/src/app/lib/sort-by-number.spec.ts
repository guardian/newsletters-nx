import { describe, expect, it } from 'vitest';
import { sortByNumber } from './sort-by-number';

interface Item {
	label: string;
	value: number | undefined;
}

const item = (label: string, value: number | undefined): Item => ({
	label,
	value,
});

describe('sortByNumber', () => {
	it('sorts ascending by default', () => {
		const items = [item('c', 3), item('a', 1), item('b', 2)];
		items.sort(sortByNumber((i) => i.value));
		expect(items.map((i) => i.label)).toEqual(['a', 'b', 'c']);
	});

	it('sorts descending when requested', () => {
		const items = [item('a', 1), item('c', 3), item('b', 2)];
		items.sort(sortByNumber((i) => i.value, 'DESCENDING'));
		expect(items.map((i) => i.label)).toEqual(['c', 'b', 'a']);
	});

	it('places nullish values last by default', () => {
		const items = [item('none', undefined), item('b', 2), item('a', 1)];
		items.sort(sortByNumber((i) => i.value, 'ASCENDING'));
		expect(items.map((i) => i.label)).toEqual(['a', 'b', 'none']);
	});

	it('places nullish values first when requested', () => {
		const items = [item('b', 2), item('none', undefined), item('a', 1)];
		items.sort(sortByNumber((i) => i.value, 'ASCENDING', 'NULLISH_FIRST'));
		expect(items.map((i) => i.label)).toEqual(['none', 'a', 'b']);
	});

	it('treats all-nullish input as equal', () => {
		const items = [item('a', undefined), item('b', undefined)];
		items.sort(sortByNumber((i) => i.value));
		expect(items.map((i) => i.label)).toEqual(['a', 'b']);
	});
});
