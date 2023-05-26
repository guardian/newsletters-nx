import type { ZodObject, ZodRawShape } from 'zod';
import { z } from 'zod';
import type { PrimitiveRecord } from '@newsletters-nx/newsletters-data-client';
import { isPrimitiveRecordArray, isStringArray } from '../../util';
import { BooleanInput } from './BooleanInput';
import { DateInput } from './DateInput';
import { NumberInput } from './NumberInput';
import { OptionalNumberInput } from './OptionalNumberInput';
import { SchemaArrayInput } from './SchemaArrayInput';
// eslint-disable-next-line import/no-cycle -- schemaForm renders recursively for SchemaRecordArrayInput
import { SchemaRecordArrayInput } from './SchemaRecordArrayInput';
// eslint-disable-next-line import/no-cycle -- schemaForm renders recursively for RecordInput
import { SchemaRecordInput } from './SchemaRecordInput';
import { SelectInput } from './SelectInput';
import { StringInput } from './StringInput';
import type { FieldDef, FieldValue, NumberInputSettings } from './util';
import { fieldValueAsDisplayString } from './util';

// T is the shape of the schema passed as a prop to the `SchemaForm`
// It is not currently used, but a better implementation or future feature may need it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- could use the schema on a better implementations
interface SchemaFieldProps<T extends z.ZodRawShape> {
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
		label: field.description ?? field.key,
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

		case 'ZodObject': {
			return (
				<SchemaRecordInput
					{...standardProps}
					recordSchema={field.recordSchema as unknown as ZodObject<ZodRawShape>}
					value={value as PrimitiveRecord}
				/>
			);
		}

		case 'ZodArray':
			switch (field.arrayItemType) {
				case 'string': {
					if (isStringArray(value) || typeof value === 'undefined') {
						return <SchemaArrayInput {...standardProps} value={value ?? []} />;
					}
					return <WrongTypeMessage field={field} />;
				}

				case 'record': {
					if (isPrimitiveRecordArray(value) || typeof value === 'undefined') {
						if (!field.recordSchema) {
							return <p>MISSING SCHEMA</p>;
						}
						return (
							<SchemaRecordArrayInput
								{...standardProps}
								value={value ?? []}
								recordSchema={field.recordSchema}
							/>
						);
					} else {
						return <WrongTypeMessage field={field} />;
					}
				}

				case 'unsupported': {
					return <WrongTypeMessage field={field} />;
				}
			}
			break;

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
	// the return statement in the default branch of the
	// switch statement does work as a 'catch-all', but the
	// linter didn't recognise this and was considering the
	// the return type to be Element | null | undefined.
	// adding an extra `return null` to supress the error.
	return null;
}
