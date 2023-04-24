import { getObjectKeyIdNumbers } from './s3-functions';
import type { S3NewsletterStorage } from './s3-newsletter-storage';

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
			Key: 'newsletters/',
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
			Key: 'newsletters/someTitle:1.json',
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
			Key: 'newsletters/someTitle:2.json',
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
			Key: 'newsletters/someTitle:3.json',
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
			Key: 'newsletters/someTitle:4.json',
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
	Prefix: 'newsletters/',
};

describe('s3-helper-functions', () => {
	test('it fetches the id elements of a list of keys', () => {
		const mockNewsletterStorage = {
			s3Client: {
				send: jest.fn(() => Promise.resolve(mockS3Response)),
			},
			bucketName: 'foo',
			OBJECT_PREFIX: 'launched-newsletters',
		} as unknown as S3NewsletterStorage;

		const expectedResult = [1, 2, 3, 4];

		expect(getObjectKeyIdNumbers(mockNewsletterStorage)).toEqual(
			expectedResult,
		);
	});
});
