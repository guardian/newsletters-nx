import { S3DraftStorage } from '@newsletters-nx/newsletters-data-client';

const s3DraftStorage = new S3DraftStorage({
	bucket: 'gu-s3-training-dblatcher',
	region: 'eu-west-1',
	profile: 'developerPlayground',
});

export { s3DraftStorage };
