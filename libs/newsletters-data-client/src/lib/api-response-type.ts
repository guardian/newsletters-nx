export type ApiResponse<T> = {
	ok: boolean;
	message?: string;
	total?: number;
	results: T;
};
