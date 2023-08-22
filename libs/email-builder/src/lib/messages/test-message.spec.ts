import { buildTestEmail, recipients } from './test-message';

const TEST_RECIPIENTS = ['test@example.com', 'example@test.net'];
const TEST_TITLE = 'Spec Email';

describe('buildTestEmail', () => {
	it('should generate content and config, using test recipients when stage is not PROD', () => {
		const output = buildTestEmail(
			{
				messageTemplateId: 'TEST',
				newsletterId: 'test-email-id',
				testTitle: TEST_TITLE,
			},
			{ testRecipients: TEST_RECIPIENTS, STAGE: 'DEV' },
		);

		expect(output.content.subject.includes(TEST_TITLE)).toBeTruthy();
		expect(output.messageConfig.recipients).toEqual(TEST_RECIPIENTS);
	});

	it('should generate content and config, sending to the recipients defined for the template on PROD', () => {
		const output = buildTestEmail(
			{
				messageTemplateId: 'TEST',
				newsletterId: 'test-email-id',
				testTitle: TEST_TITLE,
			},
			{ testRecipients: TEST_RECIPIENTS, STAGE: 'PROD' },
		);

		expect(output.content.subject.includes(TEST_TITLE)).toBeTruthy();
		expect(output.messageConfig.recipients).toEqual(recipients);
	});
});
