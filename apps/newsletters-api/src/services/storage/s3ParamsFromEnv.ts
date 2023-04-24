export type S3Params = {
	bucket: string;
	region: string;
	profile: string;
};
//todo - figure out why this is not working & also, reason about profile as this will not be present in deployed app
export const getS3Params = (): S3Params | undefined => {
	return {
		bucket: 'phill-newsletters-dev',
		region: 'eu-west-1',
		profile: 'developerPlayground',
	};
};

// export const getS3Params = (): S3Params | undefined => {
// 	const { S3_BUCKET, S3_REGIONS, S3_PROFILE } = process.env;
//
// 	if (S3_BUCKET && S3_REGIONS && S3_PROFILE) {
// 		return {
// 			bucket: S3_BUCKET,
// 			region: S3_REGIONS,
// 			profile: S3_PROFILE,
// 		};
// 	}
//
// 	return undefined;
// };
