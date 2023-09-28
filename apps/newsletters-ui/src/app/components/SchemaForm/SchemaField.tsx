import type { ZodRawShape } from 'zod';
import {
	z,
	ZodArray,
	ZodBoolean,
	ZodDate,
	ZodEnum,
	ZodNumber,
	ZodObject,
	ZodString,
} from 'zod';
import { recursiveUnwrap } from '@newsletters-nx/newsletters-data-client';
import {
	isPrimitiveRecord,
	isPrimitiveRecordArray,
	isStringArray,
} from '../../util';
import { BooleanInput } from './BooleanInput';
import { DateInput } from './DateInput';
import { FieldWrapper } from './FieldWrapper';
import { NumberInput } from './NumberInput';
import { OptionalNumberInput } from './OptionalNumberInput';
import { RadioSelectInput } from './RadioSelectInput';
import { SchemaArrayInput } from './SchemaArrayInput';
// eslint-disable-next-line import/no-cycle -- schemaForm renders recursively for SchemaRecordArrayInput
import { SchemaRecordArrayInput } from './SchemaRecordArrayInput';
import { SchemaRecordInput } from './SchemaRecordInput';
import { SelectInput } from './SelectInput';
import { StringInput } from './StringInput';
import type {
	FieldDef,
	FieldValue,
	NumberInputSettings,
	StringInputSettings,
} from './util';
import { fieldValueAsDisplayString } from './util';

// T is the shape of the schema passed as a prop to the `SchemaForm`
// It is not currently used, but a better implementation or future feature may need it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- could use the schema on a better implementations
interface SchemaFieldProps<T extends z.ZodRawShape> {
	field: FieldDef;
	change: { (value: FieldValue, field: FieldDef): void };
	options?: string[];
	showUnsupported?: boolean;
	numberInputSettings?: NumberInputSettings;
	stringInputSettings?: StringInputSettings;
	validationWarning?: string;
	maxOptionsForRadioButtons: number;
}

const WrongTypeMessage = (props: { field: FieldDef }) => (
	<div>
		wrong value type ({fieldValueAsDisplayString(props.field)}) for{' '}
		{props.field.key}
	</div>
);

const parsevalueForZodDate = (
	value: unknown,
): { value: Date | undefined } | undefined => {
	if (typeof value === 'undefined' || value instanceof Date) {
		return { value };
	}
	if (typeof value === 'string') {
		const date = new Date(value);
		const coerceCheck = z.date().safeParse(date);
		if (coerceCheck.success) {
			return { value: date };
		}
	}
	return undefined;
};

export function SchemaField<T extends z.ZodRawShape>({
	field,
	change,
	options,
	showUnsupported = false,
	numberInputSettings = {},
	stringInputSettings = {},
	validationWarning,
	maxOptionsForRadioButtons,
}: SchemaFieldProps<T>) {
	const { key, value, zod } = field;

	const inputHandler = (newValue: FieldValue) => {
		if (field.readOnly) {
			return;
		}
		if (field.zod.isOptional() && newValue === '') {
			return change(undefined, field);
		}
		change(newValue, field);
	};

	const standardProps = {
		label: field.description ?? field.key,
		inputHandler,
		readOnly: !!field.readOnly,
		optional: !!field.zod.isOptional(),
		error: validationWarning,
	};

	const innerZod = recursiveUnwrap(zod);

	if (innerZod instanceof ZodDate) {
		const parsed = parsevalueForZodDate(value);

		if (!parsed) {
			return <WrongTypeMessage field={field} />;
		}

		return (
			<FieldWrapper>
				<DateInput
					{...standardProps}
					value={parsed.value}
					type={stringInputSettings.inputType}
				/>
			</FieldWrapper>
		);
	}

	if (innerZod instanceof ZodString) {
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
					inputType={stringInputSettings.inputType}
				/>
			</FieldWrapper>
		);
	}

	if (innerZod instanceof ZodBoolean) {
		if (typeof value !== 'boolean' && typeof value !== 'undefined') {
			return <WrongTypeMessage field={field} />;
		}
		return (
			<FieldWrapper>
				<BooleanInput {...standardProps} value={value ?? false} />
			</FieldWrapper>
		);
	}

	if (innerZod instanceof ZodNumber) {
		if (typeof value !== 'number' && typeof value !== 'undefined') {
			return <WrongTypeMessage field={field} />;
		}

		if (field.zod.isOptional()) {
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
	}

	if (innerZod instanceof ZodEnum) {
		if (typeof value !== 'string' && typeof value !== 'undefined') {
			return <WrongTypeMessage field={field} />;
		}

		const options = isStringArray(innerZod.options)
			? innerZod.options
			: undefined;

		if (options && options.length <= maxOptionsForRadioButtons) {
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
				<SelectInput {...standardProps} value={value} options={options ?? []} />
			</FieldWrapper>
		);
	}

	if (innerZod instanceof ZodObject) {
		if (isPrimitiveRecord(value) || typeof value === 'undefined') {
			return (
				<FieldWrapper>
					<SchemaRecordInput
						{...standardProps}
						recordSchema={
							field.recordSchema as unknown as ZodObject<ZodRawShape>
						}
						value={value}
					/>
				</FieldWrapper>
			);
		}
		return <WrongTypeMessage field={field} />;
	}

	if (innerZod instanceof ZodArray) {
		switch (field.arrayItemType) {
			case 'string': {
				if (isStringArray(value) || typeof value === 'undefined') {
					return (
						<FieldWrapper>
							<SchemaArrayInput {...standardProps} value={value ?? []} />
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
	}

	if (showUnsupported) {
		return (
			<div>
				<b>UNSUPPORTED FIELD TYPE [{field.key}] : </b>
				{key}
				<b>{fieldValueAsDisplayString(field)}</b>
			</div>
		);
	}

	return null;
}
