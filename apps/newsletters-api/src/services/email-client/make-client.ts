import { SESClient } from '@aws-sdk/client-ses';
import { fromIni, fromNodeProviderChain } from '@aws-sdk/credential-providers';

const getStandardAwsConfig = () => {
	const { STAGE, AWS_PROFILE } = process.env;
	const shouldUseProfileCredentials = !!(STAGE && STAGE === 'DEV');
	return {
		region: 'eu-west-1',
		credentials: shouldUseProfileCredentials
			? fromIni({ profile: AWS_PROFILE ?? 'frontend' })
			: fromNodeProviderChain(),
	};
};

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
