import { S3 } from '@aws-sdk/client-s3';
import { fromIni, fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { IS_RUNNING_LOCALLY, LOCAL_PROFILE, S3_REGIONS } from './aws-params';

export const standardAwsConfig = {
	region: S3_REGIONS,
	credentials: IS_RUNNING_LOCALLY
		? fromIni({ profile: LOCAL_PROFILE })
		: fromNodeProviderChain(),
};

export const buildS3 = (): S3 => {
	return new S3(standardAwsConfig);
};
