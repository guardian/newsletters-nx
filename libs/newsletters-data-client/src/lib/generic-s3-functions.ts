import type { S3Client } from '@aws-sdk/client-s3';
import {
	DeleteObjectCommand,
	GetObjectCommand,
	ListObjectsCommand,
	PutObjectCommand,
} from '@aws-sdk/client-s3';

type S3StorageService = {
	readonly s3Client: S3Client;
	readonly bucketName: string;
	readonly OBJECT_PREFIX: string;
};

export const deleteObject =
	(s3NewsletterStorage: S3StorageService) => async (key: string) => {
		return await s3NewsletterStorage.s3Client.send(
			new DeleteObjectCommand({
				Bucket: s3NewsletterStorage.bucketName,
				Key: key,
			}),
		);
	};

export const fetchObject =
	(s3NewsletterStorage: S3StorageService) => async (key: string) => {
		return await s3NewsletterStorage.s3Client.send(
			new GetObjectCommand({
				Bucket: s3NewsletterStorage.bucketName,
				Key: key,
			}),
		);
	};

export const getListOfObjectsKeys =
	(s3NewsletterStorage: S3StorageService) => async () => {
		const listOutput = await s3NewsletterStorage.s3Client.send(
			new ListObjectsCommand({
				Bucket: s3NewsletterStorage.bucketName,
				Prefix: s3NewsletterStorage.OBJECT_PREFIX,
				MaxKeys: 500,
			}),
		);
		const { Contents = [] } = listOutput;
		return Contents.map((item) => item.Key)
			.filter((key) => typeof key === 'string')
			.filter((item) => item !== s3NewsletterStorage.OBJECT_PREFIX) as string[];
	};

export const getNextId = async (
	s3NewsletterStorage: S3StorageService,
): Promise<number> => {
	const existingNewsletterIds = await getObjectKeyIdNumbers(
		s3NewsletterStorage,
	);
	const currentHighestId = existingNewsletterIds.sort((a, b) => a - b).pop();
	return currentHighestId ? currentHighestId + 1 : 1;
};

const getStringId = (key: string): string => {
	const filenameWithExtension = key.split(':').pop();
	if (!filenameWithExtension) throw new Error('Unexpected key format');
	const stringId = filenameWithExtension.split('.')[0];
	if (!stringId) throw new Error('Unexpected key format');
	return stringId;
};

export const putObject =
	<T>(s3NewsletterStorage: S3StorageService) =>
	async (objectData: T, key: string) => {
		const createNewNewsletterCommand = new PutObjectCommand({
			Bucket: s3NewsletterStorage.bucketName,
			Key: s3NewsletterStorage.OBJECT_PREFIX + key,
			Body: JSON.stringify(objectData),
			ContentType: 'application/json',
		});

		return s3NewsletterStorage.s3Client.send(createNewNewsletterCommand);
	};

export const getObjectKeyIdNumbers = async (
	s3NewsletterStorage: S3StorageService,
): Promise<number[]> => {
	const s3Response = await s3NewsletterStorage.s3Client.send(
		new ListObjectsCommand({
			Bucket: s3NewsletterStorage.bucketName,
			Prefix: s3NewsletterStorage.OBJECT_PREFIX,
			MaxKeys: 500,
		}),
	);
	const keys = s3Response.Contents?.map((item) => item.Key) ?? [];

	const ids: number[] = [];
	return keys.reduce((acc, cur) => {
		if (typeof cur === 'string') {
			const numericId = parseInt(getStringId(cur), 10);
			if (isNaN(numericId)) {
				return acc;
			}
			return [...acc, numericId];
		}
		return acc;
	}, ids);
};

export const objectExists =
	(s3NewsletterStorage: S3StorageService) => async (Key: string) => {
		try {
			await s3NewsletterStorage.s3Client.send(
				new GetObjectCommand({
					Bucket: s3NewsletterStorage.bucketName,
					Key,
				}),
			);
		} catch (e: unknown) {
			if (e instanceof Error) {
				if (e.name === 'NoSuchKey') {
					return false;
				}
			}
			throw e;
		}
		return true;
	};
