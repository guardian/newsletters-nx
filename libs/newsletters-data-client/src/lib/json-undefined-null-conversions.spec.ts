import { replaceNullWithUndefined } from './json-undefined-null-conversions';
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

describe('replaceNullWithUndefined', () => {
	it('will handle simple cases', () => {
		const result = replaceNullWithUndefined({ ...SIMPLE_IN });
		expect(result).toEqual(SIMPLE_OUT);
	});
	it('will handle nulls in nested objects', () => {
		const result = replaceNullWithUndefined({ ...OBJECT_IN });
		expect(result).toEqual(OBJECT_OUT);
	});
	it('will handle nulls in arrays of object', () => {
		const result = replaceNullWithUndefined({ ...OBJECT_ARRAY_IN });
		expect(result).toEqual(OBJECT_ARRAY_OUT);
	});
});
