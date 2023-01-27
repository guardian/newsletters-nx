import {
	Checkbox,
	Option,
	Select,
	TextInput,
} from '@guardian/source-react-components';
import type { ReactNode } from 'react';
import type { z } from 'zod';
import {
	NumberInput,
	OptionalNumberInput,
	StringInput,
} from './formControls';
import type { FieldDef, FieldValue, NumberInputSettings } from './util';
import { eventToBoolean, eventToString } from './util';

interface SchemaFieldProps<T> {
	field: FieldDef;
	noTriState?: boolean;
	change: { (value: FieldValue, field: FieldDef): void };
	options?: string[];
	optionDescriptions?: string[];
	suggestions?: string[];
	stringInputType?: string;
	showUnsupported?: boolean;
	numberInputSettings?: NumberInputSettings;
}

export function SchemaField<T extends z.ZodRawShape>({
	field,
	change,
	noTriState,
	options,
	optionDescriptions,
	suggestions,
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
				return (
					<Select
						label={key}
						optional={field.optional}
						value={typeof field.value === 'string' ? field.value : undefined}
						onChange={(event) => {
							// using empty string as the value for the default option
							// since '' is falsy, the vaue passed the change function will
							// be undefined.
							change(event.target.value || undefined, field);
						}}
					>
						<>
							{field.optional && (
								// picking the default option should result in the field being set to undefined
								// but if the option value is undefined, the target.value the change event will
								// use the text content of the option as a fall back.
								<Option key={-1} value={''}>
									{`select ${key}`}
								</Option>
							)}
							{options.map((option) => (
								<Option key={option} value={option}>
									{option}
								</Option>
							))}
						</>
					</Select>
				);
			}

			return suggestions ? (
				<StringInput
					label={key}
					value={value ?? ''}
					type={stringInputType}
					suggestions={suggestions}
					inputHandler={(value) => {
						change(value, field);
					}}
				/>
			) : (
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

					<Select
					label={key}
					optional={field.optional}
					value={typeof field.value === 'string' ? field.value : undefined}
					onChange={(event) => {
						// using empty string as the value for the default option
						// since '' is falsy, the vaue passed the change function will
						// be undefined.
						change(event.target.value || undefined, field);
					}}
				>
					<>
						{field.optional && (
							// picking the default option should result in the field being set to undefined
							// but if the option value is undefined, the target.value the change event will
							// use the text content of the option as a fall back.
							<Option key={-1} value={''}>
								{`select ${key}`}
							</Option>
						)}
						{field.enumOptions.map((option) => (
							<Option key={option} value={option}>
								{option}
							</Option>
						))}
					</>
				</Select>


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
