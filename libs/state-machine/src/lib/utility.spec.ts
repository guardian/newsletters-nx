import type { WizardFormData } from './types';
import { replaceNullWithUndefined } from './utility';

const SIMPLE_IN: WizardFormData = {
	name: 'Bill',
	petsName: null,
};
const SIMPLE_OUT: WizardFormData = {
	name: 'Bill',
	petsName: undefined,
};

const OBJECT_IN: WizardFormData = {
	name: 'Bill',
	pet: {
		name: 'Marvin the fish',
		collarSize: null as unknown as undefined,
	},
};
const OBJECT_OUT: WizardFormData = {
	name: 'Bill',
	pet: {
		name: 'Marvin the fish',
		collarSize: undefined,
	},
};
const OBJECT_ARRAY_IN: WizardFormData = {
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
const OBJECT_ARRAY_OUT: WizardFormData = {
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
