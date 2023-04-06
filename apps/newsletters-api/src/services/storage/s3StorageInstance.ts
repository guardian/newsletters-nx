import { S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';
import { S3DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { S3Params } from './s3ParamsFromEnv';

const makeS3DraftStorageInstance = (params: S3Params): S3DraftStorage => {
	const s3Client = new S3Client({
		region: params.region,
		credentials: fromIni({ profile: params.profile }),
	});

	return new S3DraftStorage(params.bucket, s3Client);
};

export { makeS3DraftStorageInstance };
