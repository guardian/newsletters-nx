import type { z } from 'zod';
import { BooleanInput, SelectInput, StringInput } from './formControls';
import { SchemaNumber } from './SchemaNumber';
import type { FieldDef, FieldValue, NumberInputSettings } from './util';

interface SchemaFieldProps<T> {
	field: FieldDef;
	change: { (value: FieldValue, field: FieldDef): void };
	options?: string[];
	stringInputType?: string;
	showUnsupported?: boolean;
	numberInputSettings?: NumberInputSettings;
	validationWarning?: string;
}

const fieldValueAsDisplayString = (field: FieldDef): string => {
	switch (typeof field.value) {
		case 'string':
		case 'boolean':
		case 'number':
			return field.value.toString();
		case 'object':
			if (Array.isArray(field.value)) {
				return 'ARRAY';
			}
			return field.value ? field.value.toString() : 'NULL';
		default:
			return 'VALUE OF UNKNOWN TYPE';
	}
};

export function SchemaField<T extends z.ZodRawShape>({
	field,
	change,
	options,
	stringInputType,
	showUnsupported = false,
	numberInputSettings = {},
	validationWarning,
}: SchemaFieldProps<T>) {
	const { key, type, value } = field;

	if (
		type === 'ZodString' &&
		(typeof value === 'string' || typeof value === 'undefined')
	) {
		if (options) {
			return (
				<SelectInput
					label={field.key}
					value={value}
					optional={field.optional}
					inputHandler={(newValue) => {
						change(newValue, field);
					}}
					error={validationWarning}
					options={options}
				/>
			);
		}

		return (
			<StringInput
				label={key}
				value={value ?? ''}
				type={stringInputType}
				optional={field.optional}
				inputHandler={(newValue) => {
					change(newValue, field);
				}}
				error={validationWarning}
			/>
		);
	}

	if (
		type === 'ZodBoolean' &&
		(typeof value === 'boolean' || typeof value === 'undefined')
	) {
		return (
			<BooleanInput
				label={key}
				value={value ?? false}
				optional={field.optional}
				inputHandler={(newValue) => {
					change(newValue, field);
				}}
				error={validationWarning}
			/>
		);
	}

	if (type === 'ZodNumber') {
		if (typeof value === 'number' || typeof value === 'undefined') {
			return (
				<SchemaNumber
					numberValue={value}
					field={field}
					change={change}
					numberInputSettings={numberInputSettings}
					validationWarning={validationWarning}
				/>
			);
		}
	}

	if (type === 'ZodEnum' && field.enumOptions) {
		if (typeof value === 'string') {
			return (
				<SelectInput
					label={field.key}
					value={value}
					optional={field.optional}
					inputHandler={(newValue) => {
						change(newValue, field);
					}}
					error={validationWarning}
					options={field.enumOptions}
				/>
			);
		}
	}

	if (showUnsupported) {
		return (
			<div>
				<b>UNSUPPORTED FIELD TYPE [{type}] : </b>
				{key}
				<b>{fieldValueAsDisplayString(field)}</b>
			</div>
		);
	}

	return null;
}
