import {
	S3DraftStorage,
	S3NewsletterStorage,
} from '@newsletters-nx/newsletters-data-client';
import { getS3Client } from './s3-client-factory';

const getS3BucketName = (): string => {
	const { NEWSLETTER_BUCKET_NAME } = process.env;
	if (!NEWSLETTER_BUCKET_NAME) {
		throw new Error(
			'NEWSLETTER_BUCKET_NAME is undefined. Check config settings',
		);
	}
	return NEWSLETTER_BUCKET_NAME;
};
const makeS3DraftStorageInstance = (): S3DraftStorage => {
	return new S3DraftStorage(getS3BucketName(), getS3Client());
};

const getS3NewsletterStore = (): S3NewsletterStorage => {
	return new S3NewsletterStorage(getS3BucketName(), getS3Client());
};

export { makeS3DraftStorageInstance, getS3NewsletterStore };
