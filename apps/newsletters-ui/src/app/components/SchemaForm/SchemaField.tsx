import { z } from 'zod';
import { isStringArray } from '../../util';
import { BooleanInput } from './BooleanInput';
import { DateInput } from './DateInput';
import { NumberInput } from './NumberInput';
import { OptionalNumberInput } from './OptionalNumberInput';
import { SchemaArrayInput } from './SchemaArrayInput';
import { SelectInput } from './SelectInput';
import { StringInput } from './StringInput';
import type { FieldDef, FieldValue, NumberInputSettings } from './util';
import { fieldValueAsDisplayString } from './util';

interface SchemaFieldProps<T> {
	field: FieldDef;
	change: { (value: FieldValue, field: FieldDef): void };
	options?: string[];
	stringInputType?: string;
	showUnsupported?: boolean;
	numberInputSettings?: NumberInputSettings;
	validationWarning?: string;
}

const WrongTypeMessage = (props: { field: FieldDef }) => (
	<div>
		wrong value type ({fieldValueAsDisplayString(props.field)}) for{' '}
		{props.field.type}
	</div>
);

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

	const inputHandler = (newValue: FieldValue) => {
		if (field.readOnly) {
			return;
		}
		if (field.optional && newValue === '') {
			return change(undefined, field);
		}
		change(newValue, field);
	};

	const standardProps = {
		label: field.key,
		inputHandler,
		readOnly: !!field.readOnly,
		optional: !!field.optional,
		error: validationWarning,
	};

	switch (type) {
		case 'ZodDate':
			if (typeof value === 'undefined') {
				return (
					<DateInput {...standardProps} value={value} type={stringInputType} />
				);
			}
			if (typeof value === 'string') {
				const date = new Date(value);
				const coerceCheck = z.date().safeParse(date);

				if (coerceCheck.success) {
					return (
						<DateInput {...standardProps} value={date} type={stringInputType} />
					);
				}
				return <WrongTypeMessage field={field} />;
			}

			if (value instanceof Date) {
				return (
					<DateInput {...standardProps} value={value} type={stringInputType} />
				);
			}
			return <WrongTypeMessage field={field} />;

		case 'ZodString':
			if (typeof value !== 'string' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}

			if (options) {
				return (
					<SelectInput {...standardProps} value={value} options={options} />
				);
			}

			return (
				<StringInput
					{...standardProps}
					value={value ?? ''}
					type={stringInputType}
				/>
			);

		case 'ZodBoolean':
			if (typeof value !== 'boolean' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}
			return <BooleanInput {...standardProps} value={value ?? false} />;

		case 'ZodNumber':
			if (typeof value !== 'number' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}

			if (field.optional) {
				return (
					<OptionalNumberInput
						{...standardProps}
						{...numberInputSettings}
						value={value}
					/>
				);
			}

			return (
				<NumberInput
					{...standardProps}
					{...numberInputSettings}
					value={value ?? 0}
				/>
			);

		case 'ZodEnum':
			if (typeof value !== 'string' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}
			return (
				<SelectInput
					{...standardProps}
					value={value}
					options={field.enumOptions ?? []}
				/>
			);

		case 'ZodArray':
			if (field.arrayItemType === 'string') {
				if (isStringArray(value)) {
					return <SchemaArrayInput {...standardProps} value={value} />;
				}
			}

			return <WrongTypeMessage field={field} />;

		default:
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
}
