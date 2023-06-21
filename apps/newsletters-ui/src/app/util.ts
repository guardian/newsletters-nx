export {
	isPrimitiveRecord,
	isArrayOfPrimitiveRecords as isPrimitiveRecordArray,
} from '@newsletters-nx/newsletters-data-client';

export const getGuardianUrl = (relativeUrl: string): string =>
	`https://www.theguardian.com${
		relativeUrl.startsWith('/') ? '' : '/'
	}${relativeUrl}`;

export const renderYesNo = (value: boolean): string =>
	value ? '✅ Yes' : '❌ No';

export const isStringArray = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every((item) => typeof item === 'string');
