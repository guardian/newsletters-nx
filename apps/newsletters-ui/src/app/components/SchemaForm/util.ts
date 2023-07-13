import type { FormEvent } from 'react';
import type { ZodObject, ZodRawShape } from 'zod';
import type { PrimitiveRecord } from '@newsletters-nx/newsletters-data-client';
import {
	isPrimitiveRecord,
	isPrimitiveRecordArray,
	isStringArray,
} from '../../util';

export interface FieldDef {
	key: string;
	description?: string;
	optional: boolean;
	type: string;
	value: unknown;
	enumOptions?: string[];
	readOnly?: boolean;
	arrayItemType?: 'string' | 'record' | 'unsupported';
	recordSchema?: ZodObject<ZodRawShape>;
}
export type FieldValue =
	| string
	| number
	| boolean
	| undefined
	| Date
	| string[]
	| PrimitiveRecord[]
	| PrimitiveRecord;

export type NumberInputSettings = {
	min?: number;
	max?: number;
	step?: number;
};

export type StringInputSettings = {
	inputType?: 'textInput' | 'textArea';
};

export function eventToNumber(event: FormEvent, defaultValue = 0): number {
	const numericalValue = Number((event.target as HTMLInputElement).value);
	return isNaN(numericalValue) ? defaultValue : numericalValue;
}

export function eventToBoolean(
	event: FormEvent,
	defaultValue = false,
): boolean {
	return (event.target as HTMLInputElement).checked;
}

export function eventToString(event: FormEvent, defaultValue = ''): string {
	return (event.target as HTMLInputElement).value;
}

function fieldValueIsRightType(value: FieldValue, field: FieldDef): boolean {
	if (field.type === 'ZodEnum') {
		if (field.optional && typeof value === 'undefined') {
			return true;
		}
		return field.enumOptions?.includes(value as string) ?? false;
	}

	if (field.type === 'ZodDate') {
		return value instanceof Date;
	}

	if (field.type === 'ZodArray' && field.arrayItemType === 'string') {
		return isStringArray(value);
	}

	if (field.type === 'ZodArray' && field.arrayItemType === 'record') {
		// TODO - use field.recordSchema to validate each item?
		return isPrimitiveRecordArray(value);
	}

	if (field.type === 'ZodObject') {
		if (field.optional && typeof value === 'undefined') {
			return true;
		}
		// TODO - use field.recordSchema to validate item?
		// But then can'tedit one value unless all the others in the item are valid
		return isPrimitiveRecord(value);
	}

	switch (typeof value) {
		case 'undefined':
			return field.optional;
		case 'string':
			return field.type === 'ZodString';
		case 'number':
			return field.type === 'ZodNumber';
		case 'boolean':
			return field.type === 'ZodBoolean';
		default:
			return false;
	}
}

export function getModification(
	value: FieldValue,
	field: FieldDef,
): Record<string, FieldValue> {
	if (fieldValueIsRightType(value, field)) {
		const mod: Record<string, FieldValue> = {};
		mod[field.key] = value;
		return mod;
	}
	return {};
}

export const fieldValueAsDisplayString = (field: FieldDef): string => {
	switch (typeof field.value) {
		case 'string':
		case 'boolean':
		case 'number':
			return field.value.toString();
		case 'object':
			if (isStringArray(field.value)) {
				return `STRING ARRAY [${field.value.join()}]`;
			}
			if (Array.isArray(field.value)) {
				return 'ARRAY';
			}
			return field.value ? field.value.toString() : 'NULL';
		default:
			return 'VALUE OF UNKNOWN TYPE';
	}
};

export type FieldProps = {
	label?: string;
	error?: string;
	optional?: boolean;
	readOnly?: boolean;
};
