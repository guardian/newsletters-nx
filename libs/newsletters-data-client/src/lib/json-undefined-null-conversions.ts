import type { FormDataRecord } from './transformWizardData';

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

type PrimitiveRecordWithNull = Partial<
	Record<string, string | number | boolean | null>
>;
const isPrimitiveRecordAllowingNull = (
	value: unknown,
): value is PrimitiveRecordWithNull => {
	if (!value || typeof value !== 'object') {
		return false;
	}
	if (Array.isArray(value)) {
		return false;
	}
	return Object.values(value).every(
		(propertyValue) =>
			typeof propertyValue === 'boolean' ||
			typeof propertyValue === 'number' ||
			typeof propertyValue === 'string' ||
			(typeof propertyValue === 'object' && !propertyValue),
	);
};

const isArrayOfPrimitiveRecordsAllowingNull = (
	value: unknown,
): value is PrimitiveRecordWithNull[] => {
	if (!Array.isArray(value)) {
		return false;
	}
	return value.every(isPrimitiveRecordAllowingNull);
};

/** replace any value of `null` in a FormDataRecord with `undefined` */
export const replaceNullWithUndefined = (
	formData: FormDataRecord,
): FormDataRecord => {
	Object.keys(formData).forEach((key) => {
		const value = formData[key];

		if (value === null) {
			formData[key] = undefined;
		}

		if (isPrimitiveRecordAllowingNull(value)) {
			Object.keys(value).forEach((nestedkey) => {
				const nestedValue = value[nestedkey];
				if ((nestedValue as unknown) === null) {
					value[nestedkey] = undefined;
				}
			});
		}

		if (isArrayOfPrimitiveRecordsAllowingNull(value)) {
			value.forEach((objectInArray) => {
				Object.keys(objectInArray).forEach((keyOfObjectInArray) => {
					const valueOfObjectInArray = objectInArray[keyOfObjectInArray];
					if ((valueOfObjectInArray as unknown) === null) {
						objectInArray[keyOfObjectInArray] = undefined;
					}
				});
			});
		}
	});
	return formData;
};

/** replace any value of `null` in a string record with `undefined` */
export const replaceNullWithUndefinedForRecord = (
	record: Record<string, unknown>,
): Record<string, unknown> => {
	Object.keys(record).forEach((key) => {
		const value = record[key];

		if (value === null) {
			record[key] = undefined;
		}

		if (isPrimitiveRecordAllowingNull(value)) {
			Object.keys(value).forEach((nestedkey) => {
				const nestedValue = value[nestedkey];
				if ((nestedValue as unknown) === null) {
					value[nestedkey] = undefined;
				}
			});
		}

		if (isArrayOfPrimitiveRecordsAllowingNull(value)) {
			value.forEach((objectInArray) => {
				Object.keys(objectInArray).forEach((keyOfObjectInArray) => {
					const valueOfObjectInArray = objectInArray[keyOfObjectInArray];
					if ((valueOfObjectInArray as unknown) === null) {
						objectInArray[keyOfObjectInArray] = undefined;
					}
				});
			});
		}
	});
	return record;
};
