/**
 *
 * @param objectValue Given any typescript object, this function will return a string of all the values in the object recursively if the value is an object or an array. If the value is a string, number or boolean just convert to text with json stringify.
 * @returns
 */

export function createSearchStringFromObject<SearchStringObjectType>(
	objectValue: SearchStringObjectType,
	resultString: string = '',
): string | undefined {
	if (objectValue === null) {
		return resultString;
	}
	if (objectValue === undefined) {
		return resultString;
	}
	if (typeof objectValue === 'string') {
		return objectValue;
	}
	if (typeof objectValue === 'number' || typeof objectValue === 'boolean') {
		return JSON.stringify(objectValue);
	}
	if (typeof objectValue === 'object') {
		for (const value of Object.values(objectValue)) {
			if (typeof value === 'object') {
				resultString += createSearchStringFromObject(value);
			} else {
				resultString += JSON.stringify(value);
			}
		}
		return resultString;
	}
	throw new Error('type of object value is not unsupported');
}
