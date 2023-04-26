import { S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';

export const getS3Client = () => {
	const { STAGE, AWS_PROFILE } = process.env;

	const shouldUseProfileCredentials = !!(STAGE && STAGE === 'local');
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
