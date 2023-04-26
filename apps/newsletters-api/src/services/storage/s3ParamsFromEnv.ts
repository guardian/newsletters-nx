export type S3Params = {
	bucket: string;
	region: string;
	profile: string;
};

export const getS3Params = (): S3Params | undefined => {
	const { NEWSLETTER_BUCKET_NAME, S3_REGIONS, S3_PROFILE } = process.env;

	if (NEWSLETTER_BUCKET_NAME && S3_REGIONS && S3_PROFILE) {
		return {
			bucket: NEWSLETTER_BUCKET_NAME,
			region: S3_REGIONS,
			profile: S3_PROFILE,
		};
	}

	return undefined;
};
