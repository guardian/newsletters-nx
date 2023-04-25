import type {AwsCredentialIdentityProvider} from "@aws-sdk/types";

export type S3Params = {
	bucket: string;
	region: string;
	profile: string;
	credentials?: AwsCredentialIdentityProvider;
};

export const getS3Params = (): S3Params | undefined => {
	const { S3_BUCKET, S3_REGIONS, S3_PROFILE } = process.env;

	if (S3_BUCKET && S3_REGIONS && S3_PROFILE) {
		return {
			bucket: S3_BUCKET,
			region: S3_REGIONS,
			profile: S3_PROFILE,
		};
	}

	return undefined;
};
