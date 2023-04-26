import { getNextId, getObjectKeyIdNumbers, objectExists } from './s3-functions';
import type { S3NewsletterStorage } from './s3-newsletter-storage';

class MockError extends Error {
	constructor(message: string, name: string) {
		super(message);
		this.name = name;
	}
}

const mockS3Response = {
	$metadata: {
		httpStatusCode: 200,
		requestId: 'YJ0TNY7GBVQWBXFD',
		extendedRequestId:
			'uqIc49NXgYIokggVZRFcDfnJhM0541jsrwUU6qTl0ikRY1bqiormDqH3oG5T8ReRsRKaF4C57iw=',
		attempts: 1,
		totalRetryDelay: 0,
	},
	Contents: [
		{
			Key: 'launched-newsletters/',
			LastModified: '2023-04-24T14:01:09.000Z',
			ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
			Size: 0,
			StorageClass: 'STANDARD',
			Owner: {
				DisplayName: 'aws-frontend',
				ID: 'ceec8f27807cdfdca2f87527e557ede87701c4112e2e3b582401516cbe490764',
			},
		},
		{
			Key: 'launched-newsletters/someTitle:1.json',
			LastModified: '2023-04-24T14:04:32.000Z',
			ETag: '"c4739e97d2e782ab9142b7cad4e36383"',
			Size: 20,
			StorageClass: 'STANDARD',
			Owner: {
				DisplayName: 'aws-frontend',
				ID: 'ceec8f27807cdfdca2f87527e557ede87701c4112e2e3b582401516cbe490764',
			},
		},
		{
			Key: 'launched-newsletters/someTitle:2.json',
			LastModified: '2023-04-24T14:02:32.000Z',
			ETag: '"c4739e97d2e782ab9142b7cad4e36383"',
			Size: 20,
			StorageClass: 'STANDARD',
			Owner: {
				DisplayName: 'aws-frontend',
				ID: 'ceec8f27807cdfdca2f87527e557ede87701c4112e2e3b582401516cbe490764',
			},
		},
		{
			Key: 'launched-newsletters/someTitle:3.json',
			LastModified: '2023-04-24T14:02:32.000Z',
			ETag: '"c4739e97d2e782ab9142b7cad4e36383"',
			Size: 20,
			StorageClass: 'STANDARD',
			Owner: {
				DisplayName: 'aws-frontend',
				ID: 'ceec8f27807cdfdca2f87527e557ede87701c4112e2e3b582401516cbe490764',
			},
		},
		{
			Key: 'launched-newsletters/someTitle:4.json',
			LastModified: '2023-04-24T14:02:32.000Z',
			ETag: '"c4739e97d2e782ab9142b7cad4e36383"',
			Size: 20,
			StorageClass: 'STANDARD',
			Owner: {
				DisplayName: 'aws-frontend',
				ID: 'ceec8f27807cdfdca2f87527e557ede87701c4112e2e3b582401516cbe490764',
			},
		},
	],
	IsTruncated: false,
	Marker: '',
	MaxKeys: 500,
	Name: 'phill-newsletters-test',
	Prefix: 'launched-newsletters/',
};

describe('s3-functions', () => {
	describe('getObjectKeyIdNumbers', () => {
		test('it fetches the id elements of a list of keys', async () => {
			const mockNewsletterStorage = {
				s3Client: {
					send: jest.fn().mockResolvedValueOnce(mockS3Response),
				},
				bucketName: 'foo',
				OBJECT_PREFIX: 'launched-newsletters',
			} as unknown as S3NewsletterStorage;

			const expectedResult = [1, 2, 3, 4];
			const response = await getObjectKeyIdNumbers(mockNewsletterStorage);
			expect(response).toEqual(expectedResult);
		});
	});
	describe('getNextId', () => {
		test('it returns the next id where there are existing ids', () => {
			const mockNewsletterStorage = {
				s3Client: {
					send: jest.fn().mockResolvedValueOnce(mockS3Response),
				},
				bucketName: 'foo',
				OBJECT_PREFIX: 'launched-newsletters',
			} as unknown as S3NewsletterStorage;
			void expect(getNextId(mockNewsletterStorage)).resolves.toEqual(5);
		});
		test('it returns 1 where adding the first item', () => {
			const mockS3ResponseWithoutContent = { ...mockS3Response, Contents: [] };
			const mockNewsletterStorage = {
				s3Client: {
					send: jest.fn().mockResolvedValueOnce(mockS3ResponseWithoutContent),
				},
				bucketName: 'foo',
				OBJECT_PREFIX: 'launched-newsletters',
			} as unknown as S3NewsletterStorage;
			void expect(getNextId(mockNewsletterStorage)).resolves.toEqual(1);
		});
	});

	describe('objectExists', () => {
		test('it returns true when the object exists', () => {
			const mockNewsletterStorage = {
				s3Client: {
					send: jest.fn().mockResolvedValueOnce({ foo: 'bar' }),
				},
				bucketName: 'foo',
				OBJECT_PREFIX: 'launched-newsletters',
			} as unknown as S3NewsletterStorage;
			void expect(
				objectExists(mockNewsletterStorage)('someTitle:1'),
			).resolves.toEqual(true);
		});
		test('it returns false where we get a 404 from s3', () => {
			const mockNewsletterStorage = {
				s3Client: {
					send: jest
						.fn()
						.mockRejectedValueOnce(
							new MockError(
								'NoSuchKey: The specified key does not exist.',
								'NoSuchKey',
							),
						),
				},
				bucketName: 'foo',
				OBJECT_PREFIX: 'launched-newsletters',
			} as unknown as S3NewsletterStorage;
			void expect(
				objectExists(mockNewsletterStorage)('someTitle:1'),
			).resolves.toEqual(false);
		});
		test('throws unknown errors', () => {
			const mockError = new MockError('Something terrible happened.', 'BANG!');
			const mockNewsletterStorage = {
				s3Client: {
					send: jest.fn().mockRejectedValueOnce(mockError),
				},
				bucketName: 'foo',
				OBJECT_PREFIX: 'launched-newsletters',
			} as unknown as S3NewsletterStorage;
			void expect(
				objectExists(mockNewsletterStorage)('someTitle:1'),
			).rejects.toEqual(mockError);
		});
	});
});
