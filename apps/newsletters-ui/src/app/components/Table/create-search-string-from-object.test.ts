import { createSearchStringFromObject } from './create-search-string-from-object';

describe('createSearchStringFromObject', () => {
	it('Works with an integer', () => {
		const testValue = 1;
		expect(createSearchStringFromObject(testValue)).toEqual('1');
	});
	it('Works with a string', () => {
		const testValue = 'test';
		expect(createSearchStringFromObject(testValue)).toEqual('test');
	});
	it('Works with a boolean', () => {
		const testValue = true;
		expect(createSearchStringFromObject(testValue)).toEqual('true');
	});
	it('Works with an array', () => {
		const testValue = ['test'];
		expect(createSearchStringFromObject(testValue)).toEqual('test');
	});
	it('Works with an object', () => {
		const testValue = { test: 'test' };
		expect(createSearchStringFromObject(testValue)).toEqual('test');
	});
	it('Works with a nested object', () => {
		const testValue = {
			test1: 'test1',
			nested: { test2: 'test2', test3: 'test3' },
		};
		expect(createSearchStringFromObject(testValue)).toEqual('test1test2test3');
	});
	it('Works with an empty object', () => {
		const testValue = {};
		expect(createSearchStringFromObject(testValue)).toEqual('');
	});
	it('Works with a null value', () => {
		const testValue = null;
		expect(createSearchStringFromObject(testValue)).toEqual('');
	});
	it('Works with an undefined value', () => {
		const testValue = undefined;
		expect(createSearchStringFromObject(testValue)).toEqual('');
	});
});
