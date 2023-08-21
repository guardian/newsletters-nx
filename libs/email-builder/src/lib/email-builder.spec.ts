import { buildTestEmail } from './email-builder';

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
