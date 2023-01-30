import type { ApiResponse } from '@newsletters-nx/newsletters-data-client';

export const makeErrorResponse = (message: string): ApiResponse<unknown> => ({
	ok: false,
	message,
	results: undefined,
});

export function makeSuccessResponse<T extends object>(data: T): ApiResponse<T> {
	return {
		ok: true,
		total: Array.isArray(data) ? data.length : undefined,
		results: data,
	};
}
