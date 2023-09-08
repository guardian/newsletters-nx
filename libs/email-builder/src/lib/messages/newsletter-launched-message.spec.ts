import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getConfigValue } from '../../../../apps/newsletters-api/src/services/configuration/config-service';
import { buildNewsLetterLaunchMessage } from './newsletter-launched-message';

jest.mock(
	'../../../../apps/newsletters-api/src/services/configuration/config-service',
);

const mockedGetConfigValue = <jest.Mock<typeof getConfigValue>>(
	(<unknown>getConfigValue)
);
const TEST_RECIPIENTS = ['test@example.com', 'example@test.net'];

const testNewsletter: NewsletterData = {
	name: 'Spec Email',
} as NewsletterData;

describe('buildNewsLetterLaunchMessage', () => {
	it('should generate content and config, using recipients defined in config', async () => {
		mockedGetConfigValue.mockResolvedValueOnce(
			'{"tagRecipients":["alpha"],"brazeRecipients":["beta"],"signUpPageRecipients":["gamma"],"launchRecipients":["delta"]}',
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
