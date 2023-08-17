import { fromIni, fromNodeProviderChain } from '@aws-sdk/credential-providers';

export const getStandardAwsConfig = () => {
	const { STAGE, AWS_PROFILE } = process.env;
	const shouldUseProfileCredentials = !!(STAGE && STAGE === 'DEV');
	return {
		region: 'eu-west-1',
		credentials: shouldUseProfileCredentials
			? fromIni({ profile: AWS_PROFILE ?? 'frontend' })
			: fromNodeProviderChain(),
	};
};
