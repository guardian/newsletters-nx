import type { z } from 'zod';
import {
	BooleanInput,
	NumberInput,
	OptionalNumberInput,
	SelectInput,
	StringInput,
} from './formControls';
import type {
	FieldDef,
	FieldValue,
	NumberInputSettings} from './util';
import {
	fieldValueAsDisplayString,
} from './util';


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

	switch (type) {
		case 'ZodString':
			if (typeof value !== 'string' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}

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

		case 'ZodBoolean':
			if (typeof value !== 'boolean' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}
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

		case 'ZodNumber':
			if (typeof value !== 'number' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}

			if (field.optional) {
				return (
					<OptionalNumberInput
						label={field.key}
						{...numberInputSettings}
						value={value}
						inputHandler={(value) => {
							change(value, field);
						}}
						error={validationWarning}
					/>
				);
			}

			return (
				<NumberInput
					label={field.key}
					{...numberInputSettings}
					value={value ?? 0}
					inputHandler={(value) => {
						change(value, field);
					}}
					error={validationWarning}
				/>
			);

		case 'ZodEnum':
			if (typeof value !== 'string' && typeof value !== 'undefined') {
				return <WrongTypeMessage field={field} />;
			}
			return (
				<SelectInput
					label={field.key}
					value={value}
					optional={field.optional}
					inputHandler={(newValue) => {
						change(newValue, field);
					}}
					error={validationWarning}
					options={field.enumOptions ?? []}
				/>
			);

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
