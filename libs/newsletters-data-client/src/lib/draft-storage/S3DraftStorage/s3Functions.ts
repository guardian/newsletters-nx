import {
	DeleteObjectCommand,
	GetObjectCommand,
	ListObjectsCommand,
	PutObjectCommand,
} from '@aws-sdk/client-s3';
import type { DraftWithId } from '../DraftStorage';
import type { S3DraftStorage } from '.';

export const deleteObject =
	(s3DraftStorage: S3DraftStorage) => async (key: string) => {
		return await s3DraftStorage.s3Client.send(
			new DeleteObjectCommand({
				Bucket: s3DraftStorage.bucketName,
				Key: key,
			}),
		);
	};

export const fetchObject =
	(s3DraftStorage: S3DraftStorage) => async (key: string) => {
		return await s3DraftStorage.s3Client.send(
			new GetObjectCommand({
				Bucket: s3DraftStorage.bucketName,
				Key: key,
			}),
		);
	};

export const getListOfObjectsKeys =
	(s3DraftStorage: S3DraftStorage) => async () => {
		const listOutput = await s3DraftStorage.s3Client.send(
			new ListObjectsCommand({
				Bucket: s3DraftStorage.bucketName,
				Prefix: s3DraftStorage.STORAGE_FOLDER,
				MaxKeys: 500, // TODO - multiple requests if > 500?
			}),
		);
		const { Contents = [] } = listOutput;
		return Contents.map((item) => item.Key).filter(
			(key) =>
				typeof key === 'string' &&
				key.length > s3DraftStorage.STORAGE_FOLDER.length,
		) as string[];
	};

export const putDraftObject =
	(s3DraftStorage: S3DraftStorage) => async (draft: DraftWithId) => {
		const key = s3DraftStorage.listIdToKey(draft.listId);
		const body = JSON.stringify(draft);

		return await s3DraftStorage.s3Client.send(
			new PutObjectCommand({
				Bucket: s3DraftStorage.bucketName,
				Key: key,
				Body: body,
			}),
		);
	};
