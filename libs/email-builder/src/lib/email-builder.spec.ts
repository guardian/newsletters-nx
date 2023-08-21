import { buildTestMessage } from './email-builder';

describe('emailBuilder', () => {
	it('should work', () => {
		expect(buildTestMessage('test-email-id')).toBeDefined;
	});
});
