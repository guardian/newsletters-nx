import { S3Client } from '@aws-sdk/client-s3';
import { fromIni, fromNodeProviderChain } from '@aws-sdk/credential-providers';

export const getS3Client = () => {
	const { STAGE, AWS_PROFILE } = process.env;

	const shouldUseProfileCredentials = !!(STAGE && STAGE === 'DEV');
	if (shouldUseProfileCredentials) {
		const profile = AWS_PROFILE ?? 'developerPlayground';
		return new S3Client({
			region: 'eu-west-1',
			credentials: fromIni({ profile }),
		});
	}
	return new S3Client({
		region: 'eu-west-1',
	});
};

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
