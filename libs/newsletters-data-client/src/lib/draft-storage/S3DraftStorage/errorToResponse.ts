import { NoSuchKey, S3ServiceException } from '@aws-sdk/client-s3';
import type { UnsuccessfulStorageResponse } from '../DraftStorage';
import { StorageRequestFailureReason } from '../DraftStorage';

export const errorToResponse = (
	err: unknown,
	listId?: number,
): UnsuccessfulStorageResponse => {
	if (err instanceof NoSuchKey) {
		const message = listId
			? `draft with listId ${listId} does not exist.`
			: `requested item does not exist`;

		return {
			ok: false,
			message,
			reason: StorageRequestFailureReason.NotFound,
		};
	}

	if (err instanceof S3ServiceException) {
		// NOTE - the reason is not communicated to the UI as the "executeStep" functions
		// on the WizardStepLayoutButton only returns a string (not an error) in the event
		// of failure.
		if (err.name === 'ExpiredToken') {
			const message =
				'The tool does not have permissions to access the storage system. Please report this error.';
			return {
				ok: false,
				message,
				reason: StorageRequestFailureReason.NoCredentials,
			};
		}

		return {
			ok: false,
			message: err.message,
			reason: StorageRequestFailureReason.S3Failure,
		};
	}

	const message = err instanceof Error ? err.message : 'UNKNOWN ERROR';
	return {
		ok: false,
		message,
	};
};
