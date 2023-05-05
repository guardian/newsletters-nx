import { StorageRequestFailureReason } from '@newsletters-nx/newsletters-data-client';
import type { ApiResponse } from '@newsletters-nx/newsletters-data-client';

// TODO - make the error response type generic
export const makeErrorResponse = (message: string): ApiResponse => ({
	ok: false,
	message,
});

export function makeSuccessResponse<T extends object>(data: T): ApiResponse<T> {
	return {
		ok: true,
		total: Array.isArray(data) ? data.length : 1,
		data,
	};
}

export const mapStorageFailureReasonToStatusCode = (
	reason?: StorageRequestFailureReason,
): number => {
	switch (reason) {
		case StorageRequestFailureReason.InvalidDataInput:
			return 400;
		case StorageRequestFailureReason.NotFound:
			return 404;
		case StorageRequestFailureReason.NoCredentials:
			return 403;
		case StorageRequestFailureReason.DataInStoreNotValid:
			return 422;
		default:
			return 500;
	}
};
