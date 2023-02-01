import { createSearchStringFromObject } from './CreateSearchStringFromObject';

describe('createSearchStringFromObject', () => {
	it('Works with an integer', () => {
		const testValue = 1;
		expect(createSearchStringFromObject(testValue)).toEqual('1');
	});
  it('Works with a string', () => {
    const testValue = 'test';
    expect(createSearchStringFromObject(testValue)).toEqual('test');
  })
  it('Works with a boolean', () => {
    const testValue = true;
    expect(createSearchStringFromObject(testValue)).toEqual('true');
  })
  it('Works with an object', () => {
    const testValue = {test: 'test'};
    expect(createSearchStringFromObject(testValue)).toEqual('test');
  }
});
