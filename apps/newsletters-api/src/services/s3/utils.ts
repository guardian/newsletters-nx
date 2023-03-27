import type AWS_S3 from '@aws-sdk/client-s3';
import { ListObjectsCommand } from '@aws-sdk/client-s3';
import { BUCKET, s3Client } from './credentials';

export const listObjects = async (
	prefix: string,
	maxKeys = 100,
): Promise<AWS_S3.ListObjectsCommandOutput> => {
	const input: AWS_S3.ListObjectVersionsCommandInput = {
		Bucket: BUCKET,
		Prefix: prefix,
		MaxKeys: maxKeys,
	};

	return s3Client.send(new ListObjectsCommand(input));
};

// /**
//  * Make an s3 getObject request from the predefined bucket.
//  *
//  * @param key the s3 Object key
//  * @returns the s3 Object, or undefined if the getObject request throws a 404 error
//  * @throws AWSError (not 404)
//  */
// export const getObject = async (
// 	key: string,
// ): Promise<AWS_S3.GetObjectCommandOutput | undefined> => {
// 	return new Promise((resolve, reject) => {
// 		s3.getObject(
// 			{
// 				Bucket: BUCKET,
// 				Key: key,
// 			},
// 			(err, data) => {
// 				if (err) {
// 					if (err.statusCode === 404) {
// 						return resolve(undefined);
// 					}
// 					return reject(err);
// 				}
// 				return resolve(data);
// 			},
// 		);
// 	});
// };

// export const upload = async (
// 	key: string,
// 	body: AWS_S3.Body,
// 	params: Omit<AWS_S3.PutObjectCommandInput, 'Bucket' | 'Key' | 'ACL'>,
// ): Promise<S3.ManagedUpload.SendData> => {
// 	return new Promise((resolve, reject) => {
// 		s3.upload(
// 			{ ...params, Bucket: BUCKET, Key: key, Body: body, ACL: 'public-read' },
// 			(err, data) => {
// 				if (err) {
// 					return reject(err);
// 				}

// 				return resolve(data);
// 			},
// 		);
// 	});
// };

// export const uploadDryRun = async (
// 	key: string,
// 	body: S3.Body,
// 	params: Omit<S3.PutObjectRequest, 'Bucket' | 'Key' | 'ACL'>,
// ): Promise<S3.ManagedUpload.SendData> => {
// 	return {
// 		Key: key,
// 		Bucket: BUCKET,
// 		Location: `${CDN_BASE}/${key}`,
// 		ETag: 'DRY RUN',
// 	};
// };
