export const parseToNumber = (input: unknown): number | undefined => {
	const number = Number(input);
	if (isNaN(number)) {
		return undefined;
	}
	return number;
};
