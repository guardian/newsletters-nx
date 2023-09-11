import { SESClient } from '@aws-sdk/client-ses';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getConfigValue } from '@newsletters-nx/util';
import { sendEmailNotifications } from './service';
import type { MessageParams } from './types';

jest.mock('@aws-sdk/client-ses');
jest.mock('@newsletters-nx/util');

const mockedGetConfigValue = <jest.Mock<typeof getConfigValue>>(
	(<unknown>getConfigValue)
);

const testNewsletter: NewsletterData = {
	name: 'Spec Email',
} as NewsletterData;

const TEST_MESSAGE_PARAMS: MessageParams = {
	messageTemplateId: 'NEWSLETTER_LAUNCH',
	newsletter: testNewsletter,
};

const TEST_RECIPIENTS = ['test@example.com', 'test_two@example.com'];

describe('sendEmailNotifications', () => {
	it('will not send a message if notifications are not enabled', async () => {
		const mockedClient = new SESClient();

		const results = await sendEmailNotifications(
			TEST_MESSAGE_PARAMS,
			mockedClient,
			{
				areEmailNotificationsEnabled: false,
				STAGE: 'DEV',
				testRecipients: TEST_RECIPIENTS,
			},
		);

		expect(results.success).toBe(true);
		expect(mockedClient.send).not.toHaveBeenCalled();
	});

	it('sends messages when notifications are enabled', async () => {
		const mockedClient = new SESClient();
		mockedGetConfigValue.mockResolvedValueOnce(
			'{"foo":["foo"],"bar":["bar"],"baz":["baz"]}',
		);
		const results = await sendEmailNotifications(
			TEST_MESSAGE_PARAMS,
			mockedClient,
			{
				areEmailNotificationsEnabled: true,
				STAGE: 'DEV',
				testRecipients: TEST_RECIPIENTS,
			},
		);

		expect(results.success).toBe(true);
		expect(mockedClient.send).toHaveBeenCalledTimes(1);
	});
});
