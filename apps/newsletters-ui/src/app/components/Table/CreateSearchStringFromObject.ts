/**
 *
 * @param objectValue Given any typescript object, this function will return a string of all the values in the object recursively if the value is an object or an array. If the value is a string, number or boolean just convert to text with json stringify.
 * @returns
 */

export function createSearchStringFromObject<SearchStringObjectType>(
	objectValue: SearchStringObjectType,
	resultString = '',
): string {
	if (objectValue === null || objectValue === undefined) {
		return resultString;
	}
	switch (typeof objectValue) {
		case 'string':
			return objectValue;
		case 'number':
		case 'boolean':
			return JSON.stringify(objectValue);
		case 'object':
			for (const value of Object.values(objectValue)) {
				resultString += createSearchStringFromObject(value);
			}
			return resultString;
	}
	throw new Error('type of object value is not unsupported');
}
