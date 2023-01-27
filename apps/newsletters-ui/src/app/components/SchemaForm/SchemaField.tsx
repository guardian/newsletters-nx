import { Checkbox, TextInput } from '@guardian/source-react-components';
import type { ReactNode } from 'react';
import type { z } from 'zod';
import { NumberInput, OptionalNumberInput } from './formControls';
import { SchemaSelect } from './SchemaSelect';
import type { FieldDef, FieldValue, NumberInputSettings } from './util';
import { eventToBoolean, eventToString } from './util';

interface SchemaFieldProps<T> {
	field: FieldDef;
	change: { (value: FieldValue, field: FieldDef): void };
	options?: string[];
	stringInputType?: string;
	showUnsupported?: boolean;
	numberInputSettings?: NumberInputSettings;
}

export function SchemaField<T extends z.ZodRawShape>({
	field,
	change,
	options,
	stringInputType,
	showUnsupported = false,
	numberInputSettings = {},
}: SchemaFieldProps<T>) {
	const { key, type, value } = field;
	const isSupported = [
		'ZodString',
		'ZodBoolean',
		'ZodNumber',
		'ZodEnum',
	].includes(type);
	if (!isSupported && !showUnsupported) {
		return null;
	}

	let safeValue: FieldValue;
	switch (typeof value) {
		case 'string':
		case 'boolean':
		case 'number':
			// eslint-disable-next-line prefer-const -- switch
			safeValue = value;
	}

	function buildInput(): ReactNode | null {
		if (
			type === 'ZodString' &&
			(typeof value === 'string' || typeof value === 'undefined')
		) {
			if (options) {
				return <SchemaSelect field={field} change={change} options={options} />;
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
				return field.optional ? (
					<OptionalNumberInput
						label={key}
						{...numberInputSettings}
						value={value}
						inputHandler={(value) => {
							change(value, field);
						}}
					/>
				) : (
					<NumberInput
						label={key}
						{...numberInputSettings}
						value={value ?? 0}
						inputHandler={(value) => {
							change(value, field);
						}}
					/>
				);
			}
		}

		if (type === 'ZodEnum' && field.enumOptions) {
			if (typeof value === 'string') {
				return (
					<SchemaSelect
						field={field}
						change={change}
						options={field.enumOptions}
					/>
				);
			}
		}

		if (showUnsupported) {
			return (
				<div key={key}>
					<b>UNSUPPORTED | </b>
					{key} |{type}
					<b>{safeValue?.toString()}</b>
				</div>
			);
		}

		return null;
	}

	return buildInput();
}
