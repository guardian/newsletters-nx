/**
 * Replacer function for JSON,stringify - recursively changes values explictly set
 * to `undefined` with `null` values.
 *
 * If explicit 'undefined' values are excluded from the data, it is impossible for
 * the client to "unset" a previously set value on the server by making it "undefined".
 *
 * see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
 *
 * Since `undefined` is not value JSON and gets ommitted from the string.
 * Server-side, the `null`s can be replaced back to `undefined`.
 */
export const replaceUndefinedWithNull = (
	key: string,
	value: unknown,
): unknown => {
	if (value === undefined) {
		return null;
	}
	return value;
};
