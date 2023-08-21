import { buildTestEmail } from './test-message';

describe('buildTestEmail', () => {
	it('should work', () => {
		expect(
			buildTestEmail(
				{
					messageTemplateId: 'TEST',
					newsletterId: 'test-email-id',
					testTitle: 'Spec Email',
				},
				{},
			),
		).toBeDefined;
	});
});
