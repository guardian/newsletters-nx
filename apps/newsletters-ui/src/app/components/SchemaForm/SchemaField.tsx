import {
	Checkbox,
	InlineError,
	TextInput,
} from '@guardian/source-react-components';
import type { z } from 'zod';
import { SelectInput } from './formControls';
import { SchemaNumber } from './SchemaNumber';
import type { FieldDef, FieldValue, NumberInputSettings } from './util';
import { eventToBoolean, eventToString } from './util';

interface SchemaFieldProps<T> {
	field: FieldDef;
	change: { (value: FieldValue, field: FieldDef): void };
	options?: string[];
	stringInputType?: string;
	showUnsupported?: boolean;
	numberInputSettings?: NumberInputSettings;
	validationWarning?: string;
}

const fieldValueAsSting = (field: FieldDef): string => {
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
			return '';
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
						change(newValue, field)
					}}
					error={validationWarning}
					options={options}
				/>
			);
		}

		return (
			<TextInput
				label={key}
				value={value}
				type={stringInputType}
				onChange={(event) => {
					change(eventToString(event), field);
				}}
				required={!field.optional}
				error={validationWarning}
			/>
		);
	}

	if (
		type === 'ZodBoolean' &&
		(typeof value === 'boolean' || typeof value === 'undefined')
	) {
		return (
			<Checkbox
				label={key}
				checked={!!value}
				onChange={(event) => {
					change(eventToBoolean(event), field);
				}}
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
						change(newValue, field)
					}}
					error={validationWarning}
					options={field.enumOptions}
				/>
			);
		}
	}

	if (showUnsupported) {
		return (
			<InlineError>
				<b>UNSUPPORTED FIELD TYPE [{type}] : </b>
				{key}
				<b>{fieldValueAsSting(field)}</b>
			</InlineError>
		);
	}

	return null;
}
