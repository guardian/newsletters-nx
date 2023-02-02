type ApiErrorResponse = {
	ok: false;
	message?: string;
};

type ApiSuccessResponse<T> = {
	ok: true;
	total: number;
	data: T;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
