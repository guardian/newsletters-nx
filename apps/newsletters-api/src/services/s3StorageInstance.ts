import { S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';
import { S3DraftStorage } from '@newsletters-nx/newsletters-data-client';

const params = {
	bucket: 'gu-s3-training-dblatcher',
	region: 'eu-west-1',
	profile: 'developerPlayground',
};

const s3Client = new S3Client({
	region: params.region,
	credentials: fromIni({ profile: params.profile }),
});

const s3DraftStorage = new S3DraftStorage(params.bucket, s3Client);

export { s3DraftStorage };
