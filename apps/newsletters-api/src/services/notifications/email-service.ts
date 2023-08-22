import { SESClient } from '@aws-sdk/client-ses';
import { getStandardAwsConfig } from '../aws/aws-config-service';

export const makeSesClient = () => {
	const emailClient = new SESClient(getStandardAwsConfig());
	return emailClient;
};

export const makeEmailEnvInfo = (): {
	STAGE?: string | undefined;
	TEST_EMAIL_RECIPIENT?: string | undefined;
} => {
	const { STAGE, TEST_EMAIL_RECIPIENT } = process.env;

	return {
		STAGE,
		TEST_EMAIL_RECIPIENT,
	};
};
