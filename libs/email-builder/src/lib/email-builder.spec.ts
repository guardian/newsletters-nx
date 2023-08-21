import { testMessageBuilder } from './email-builder';

describe('emailBuilder', () => {
	it('should work', () => {
		expect(testMessageBuilder('test-email-id')).toBeDefined;
	});
});
