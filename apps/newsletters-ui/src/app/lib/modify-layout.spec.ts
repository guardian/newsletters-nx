import { describe, expect, it } from 'vitest';
import { getReorderIndex } from './modify-layout';

const ids = ['a', 'b', 'c'];

describe('getReorderIndex', () => {
	it('moves an item down when dropped after a later item', () => {
		expect(getReorderIndex(ids, 'a', 'b', 'after')).toEqual({ from: 0, to: 1 });
	});
	it('moves an item up when dropped before an earlier item', () => {
		expect(getReorderIndex(ids, 'c', 'b', 'before')).toEqual({
			from: 2,
			to: 1,
		});
	});
	it('moves an item to the top', () => {
		expect(getReorderIndex(ids, 'c', 'a', 'before')).toEqual({
			from: 2,
			to: 0,
		});
	});
	it('moves an item to the bottom', () => {
		expect(getReorderIndex(ids, 'a', 'c', 'after')).toEqual({ from: 0, to: 2 });
	});
	it('returns undefined when dropped next to itself', () => {
		expect(getReorderIndex(ids, 'b', 'a', 'after')).toBeUndefined();
		expect(getReorderIndex(ids, 'b', 'c', 'before')).toBeUndefined();
		expect(getReorderIndex(ids, 'b', 'b', 'before')).toBeUndefined();
		expect(getReorderIndex(ids, 'b', 'b', 'after')).toBeUndefined();
	});
	it('returns undefined for an unknown id', () => {
		expect(getReorderIndex(ids, 'x', 'a', 'before')).toBeUndefined();
		expect(getReorderIndex(ids, 'a', 'x', 'after')).toBeUndefined();
	});
});
