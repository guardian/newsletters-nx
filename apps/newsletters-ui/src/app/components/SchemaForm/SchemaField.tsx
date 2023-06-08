import { z } from 'zod';
import { isPrimitiveRecordArray, isStringArray } from '../../util';
import { BooleanInput } from './BooleanInput';
import { DateInput } from './DateInput';
import { FieldWrapper } from './FieldWrapper';
import { NumberInput } from './NumberInput';
import { OptionalNumberInput } from './OptionalNumberInput';
import { RadioSelectInput } from './RadioSelectInput';
import { SchemaArrayInput } from './SchemaArrayInput';
// eslint-disable-next-line import/no-cycle -- schemaForm renders recursively for SchemaRecordArrayInput
import { SchemaRecordArrayInput } from './SchemaRecordArrayInput';
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
	maxOptionsForRadioButtons: number;
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
	maxOptionsForRadioButtons,
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
					<FieldWrapper>
						<DateInput
							{...standardProps}
							value={value}
							type={stringInputType}
						/>
					</FieldWrapper>
				);
			}
			if (typeof value === 'string') {
				const date = new Date(value);
				const coerceCheck = z.date().safeParse(date);

				if (coerceCheck.success) {
					return (
						<FieldWrapper>
							<DateInput
								{...standardProps}
								value={date}
								type={stringInputType}
							/>
						</FieldWrapper>
					);
				}
				return <WrongTypeMessage field={field} />;
			}

			if (value instanceof Date) {
				return (
					<FieldWrapper>
						<DateInput
							{...standardProps}
							value={value}
							type={stringInputType}
						/>
					</FieldWrapper>
				);
			}
			return <WrongTypeMessage field={field} />;

		case 'ZodString':
			if (typeof value !== 'string' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}

			if (options) {
				if (options.length <= maxOptionsForRadioButtons) {
					return (
						<FieldWrapper>
							<RadioSelectInput
								{...standardProps}
								value={value}
								options={options}
							/>
						</FieldWrapper>
					);
				}
				return (
					<FieldWrapper>
						<SelectInput {...standardProps} value={value} options={options} />
					</FieldWrapper>
				);
			}

			return (
				<FieldWrapper>
					<StringInput
						{...standardProps}
						value={value ?? ''}
						type={stringInputType}
					/>
				</FieldWrapper>
			);

		case 'ZodBoolean':
			if (typeof value !== 'boolean' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}
			return (
				<FieldWrapper>
					<BooleanInput {...standardProps} value={value ?? false} />
				</FieldWrapper>
			);

		case 'ZodNumber':
			if (typeof value !== 'number' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}

			if (field.optional) {
				return (
					<FieldWrapper>
						<OptionalNumberInput
							{...standardProps}
							{...numberInputSettings}
							value={value}
						/>
					</FieldWrapper>
				);
			}

			return (
				<FieldWrapper>
					<NumberInput
						{...standardProps}
						{...numberInputSettings}
						value={value ?? 0}
					/>
				</FieldWrapper>
			);

		case 'ZodEnum':
			if (typeof value !== 'string' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}

			if (
				field.enumOptions &&
				field.enumOptions.length <= maxOptionsForRadioButtons
			) {
				return (
					<FieldWrapper>
						<RadioSelectInput
							{...standardProps}
							value={value}
							options={field.enumOptions}
						/>
					</FieldWrapper>
				);
			}

			return (
				<FieldWrapper>
					<SelectInput
						{...standardProps}
						value={value}
						options={field.enumOptions ?? []}
					/>
				</FieldWrapper>
			);

		case 'ZodArray':
			switch (field.arrayItemType) {
				case 'string': {
					if (isStringArray(value) || typeof value === 'undefined') {
						return (
							<FieldWrapper>
								<SchemaArrayInput {...standardProps} value={value ?? []} />;
							</FieldWrapper>
						);
					}
					return <WrongTypeMessage field={field} />;
				}

				case 'record': {
					if (isPrimitiveRecordArray(value) || typeof value === 'undefined') {
						if (!field.recordSchema) {
							return <p>MISSING SCHEMA</p>;
						}
						return (
							<FieldWrapper>
								<SchemaRecordArrayInput
									{...standardProps}
									value={value ?? []}
									recordSchema={field.recordSchema}
									maxOptionsForRadioButtons={maxOptionsForRadioButtons}
								/>
							</FieldWrapper>
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
