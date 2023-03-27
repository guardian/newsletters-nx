import { S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';

// Set the AWS Region.
const REGION = 'eu-west-1';
const BUCKET = 'gu-s3-training-dblatcher';

// Create an Amazon S3 service client object.
const s3Client = new S3Client({
	region: REGION,
	credentials: fromIni({ profile: 'developerPlayground' }),
});

export { s3Client, BUCKET };
