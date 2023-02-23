import type { ApiResponse } from '@newsletters-nx/newsletters-data-client';

// TO DO - make the error response type generic
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
