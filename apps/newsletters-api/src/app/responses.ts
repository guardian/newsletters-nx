export const makeError = (message: string, code = 500) => ({
	ok: false,
	message,
	code,
});

export function makeSuccess<T extends object>(
	content: T,
): T & { ok: true; code: 200 } {
	return {
		...content,
		ok: true,
		code: 200,
	};
}
