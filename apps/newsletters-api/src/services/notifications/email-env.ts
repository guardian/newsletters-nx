import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { areEmailNotificationsEnabled } from '../../apiDeploymentSettings';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const splitEmailConfig = (emailsString?: string): string[] => {
	if (!emailsString) {
		return [];
	}

	return emailsString
		.split(';')
		.map((email) => email.trim())
		.filter((email) => email.length > 0)
		.filter((email) => emailRegex.test(email));
};

export const makeEmailEnvInfo = (): EmailEnvInfo => {
	const { STAGE, TEST_EMAIL_RECIPIENTS } = process.env;

	return {
		STAGE,
		testRecipients: splitEmailConfig(TEST_EMAIL_RECIPIENTS),
		areEmailNotificationsEnabled: areEmailNotificationsEnabled(),
	};
};
