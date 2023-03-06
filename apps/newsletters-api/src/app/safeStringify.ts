/**
 * Attempts to stringify an unknown. returns the stringified fallback
 * object if the unknown cannot be stringified
 */
export const safeStringify = (
	err: unknown,
	fallback: object,
): string | undefined => {
	try {
		return JSON.stringify(err);
	} catch (jsonError) {
		return JSON.stringify(fallback);
	}
};
