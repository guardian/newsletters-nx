import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getConfigValue } from '@newsletters-nx/util';
import { buildNewsLetterLaunchMessage } from './newsletter-launched-message';

jest.mock('@newsletters-nx/util');

const mockedGetConfigValue = getConfigValue as jest.Mock;
const TEST_RECIPIENTS = ['test@example.com', 'example@test.net'];

const testNewsletter: NewsletterData = {
	name: 'Spec Email',
} as NewsletterData;

describe('buildNewsLetterLaunchMessage', () => {
	test('should generate content and config, using recipients defined in config', async () => {
		mockedGetConfigValue.mockResolvedValueOnce(
			'{"centralProductionRecipients":["alpha"],"brazeRecipients":["beta"],"launchRecipients":["delta"]}',
		);
		const output = await buildNewsLetterLaunchMessage(
			{
				messageTemplateId: 'NEWSLETTER_LAUNCH',
				newsletter: testNewsletter,
			},
			{
				testRecipients: TEST_RECIPIENTS,
				STAGE: 'DEV',
				areEmailNotificationsEnabled: true,
			},
		);

		expect(output.content.subject.includes(testNewsletter.name)).toBeTruthy();
		expect(output.messageConfig.recipients).toEqual(['delta']);
	});
});
