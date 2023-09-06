import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import {
	buildNewsLetterLaunchMessage,
	newsletterLaunchedRecipients,
} from './newsletter-launched-message';

const TEST_RECIPIENTS = ['test@example.com', 'example@test.net'];

const testNewsletter: NewsletterData = {
	name: 'Spec Email',
} as NewsletterData;

describe('buildNewsLetterLaunchMessage', () => {
	it('should generate content and config, using test recipients when stage is not PROD', () => {
		const output = buildNewsLetterLaunchMessage(
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
		expect(output.messageConfig.recipients).toEqual(TEST_RECIPIENTS);
	});

	it('should generate content and config, sending to the recipients defined for the template on PROD', () => {
		const output = buildNewsLetterLaunchMessage(
			{
				messageTemplateId: 'NEWSLETTER_LAUNCH',
				newsletter: testNewsletter,
			},
			{
				testRecipients: TEST_RECIPIENTS,
				STAGE: 'PROD',
				areEmailNotificationsEnabled: true,
			},
		);

		expect(output.content.subject.includes(testNewsletter.name)).toBeTruthy();
		expect(output.messageConfig.recipients).toEqual(
			newsletterLaunchedRecipients,
		);
	});
});
