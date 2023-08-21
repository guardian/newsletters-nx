import { buildTestEmail } from './email-builder';

describe('buildTestEmail', () => {
	it('should work', () => {
		expect(buildTestEmail('test-email-id', {})).toBeDefined;
	});
});
