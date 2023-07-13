import {
	replaceNullWithUndefinedForUnknown,
	replaceNullWithUndefinedInFormDataRecord,
} from './json-undefined-null-conversions';
import type { FormDataRecord } from './transformWizardData';

const SIMPLE_IN: FormDataRecord = {
	name: 'Bill',
	petsName: null,
};
const SIMPLE_OUT: FormDataRecord = {
	name: 'Bill',
	petsName: undefined,
};

const OBJECT_IN: FormDataRecord = {
	name: 'Bill',
	pet: {
		name: 'Marvin the fish',
		collarSize: null as unknown as undefined,
	},
};
const OBJECT_OUT: FormDataRecord = {
	name: 'Bill',
	pet: {
		name: 'Marvin the fish',
		collarSize: undefined,
	},
};
const OBJECT_ARRAY_IN: FormDataRecord = {
	name: 'Bill',
	children: [
		{
			name: 'Sally',
			age: 4,
			favouriteFood: 'chips',
		},
		{
			name: 'Norma',
			age: 1,
			favouriteFood: null as unknown as undefined,
		},
	],
};
const OBJECT_ARRAY_OUT: FormDataRecord = {
	name: 'Bill',
	children: [
		{
			name: 'Sally',
			age: 4,
			favouriteFood: 'chips',
		},
		{
			name: 'Norma',
			age: 1,
			favouriteFood: undefined,
		},
	],
};

describe('replaceNullWithUndefinedInFormDataRecord', () => {
	it('will handle simple cases', () => {
		const result = replaceNullWithUndefinedInFormDataRecord({ ...SIMPLE_IN });
		expect(result).toEqual(SIMPLE_OUT);
	});
	it('will handle nulls in nested objects', () => {
		const result = replaceNullWithUndefinedInFormDataRecord({ ...OBJECT_IN });
		expect(result).toEqual(OBJECT_OUT);
	});
	it('will handle nulls in arrays of object', () => {
		const result = replaceNullWithUndefinedInFormDataRecord({
			...OBJECT_ARRAY_IN,
		});
		expect(result).toEqual(OBJECT_ARRAY_OUT);
	});
});

describe('replaceNullWithUndefinedForUnknown', () => {
	it('will handle simple cases', () => {
		const result = replaceNullWithUndefinedForUnknown({ ...SIMPLE_IN });
		expect(result).toEqual(SIMPLE_OUT);
	});
	it('will handle nulls in nested objects', () => {
		const result = replaceNullWithUndefinedForUnknown({ ...OBJECT_IN });
		expect(result).toEqual(OBJECT_OUT);
	});
	it('will handle nulls in arrays of object', () => {
		const result = replaceNullWithUndefinedForUnknown({
			...OBJECT_ARRAY_IN,
		});
		expect(result).toEqual(OBJECT_ARRAY_OUT);
	});

	it('will convert null primitives to undefined', () => {
		const result = replaceNullWithUndefinedForUnknown(null);
		expect(result).toEqual(undefined);
	});
	it('will convert null primitives to in an array to undefined', () => {
		const result = replaceNullWithUndefinedForUnknown([
			1,
			null,
			'this is a string',
		]);
		expect(result).toEqual([1, undefined, 'this is a string']);
	});
	it('will convert null deeply nested nulls to in an object to undefined', () => {
		const result = replaceNullWithUndefinedForUnknown({
			a: {
				value: null,
				b: {
					value: 'test',
					c: {
						value: null,
					},
				},
			},
		});
		expect(result).toEqual({
			a: {
				value: undefined,
				b: {
					value: 'test',
					c: {
						value: undefined,
					},
				},
			},
		});
	});
});
