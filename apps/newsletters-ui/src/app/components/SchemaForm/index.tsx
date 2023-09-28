import type { z, ZodRawShape, ZodTypeAny } from 'zod';
import { ZodArray, ZodObject, ZodString } from 'zod';
import { recursiveUnwrap } from '@newsletters-nx/newsletters-data-client';
// eslint-disable-next-line import/no-cycle -- schemaForm renders recursively for SchemaRecordArrayInput
import { SchemaField } from './SchemaField';
import type {
	FieldDef,
	FieldValue,
	NumberInputSettings,
	StringInputSettings,
} from './util';

export * from './util';

interface Props<T extends z.ZodRawShape> {
	schema: z.ZodObject<T>;
	data: Record<string, unknown>;
	changeValue: { (value: FieldValue, field: FieldDef): void };
	options?: Partial<Record<keyof T, string[]>>;
	numberConfig?: Partial<Record<keyof T, NumberInputSettings>>;
	stringConfig?: Partial<Record<keyof T, StringInputSettings>>;
	showUnsupported?: boolean;
	excludedKeys?: string[];
	readOnlyKeys?: string[];
	validationWarnings: Partial<Record<keyof T, string>>;
	maxOptionsForRadioButtons?: number;
}

/**
 * Creates a form for the schema, Supports only primitives, optional primitives
 * and required string enums.
 */
export function SchemaForm<T extends z.ZodRawShape>({
	schema,
	data,
	changeValue,
	options = {},
	numberConfig = {},
	stringConfig = {},
	showUnsupported = false,
	excludedKeys = [],
	readOnlyKeys = [],
	validationWarnings,
	maxOptionsForRadioButtons = 0,
}: Props<T>) {
	const fields: FieldDef[] = [];
	for (const key in schema.shape) {
		const zod: ZodTypeAny | undefined = schema.shape[key];
		if (!zod) {
			continue;
		}

		if (excludedKeys.includes(key)) {
			continue;
		}

		fields.push({
			key,
			value: data[key],
			readOnly: readOnlyKeys.includes(key),
			zod,
		});
	}

	return (
		<article>
			{fields.map((field) => (
				<SchemaField
					key={field.key}
					options={options[field.key]}
					numberInputSettings={numberConfig[field.key]}
					stringInputSettings={stringConfig[field.key]}
					change={changeValue}
					field={field}
					showUnsupported={showUnsupported}
					validationWarning={validationWarnings[field.key]}
					maxOptionsForRadioButtons={maxOptionsForRadioButtons}
				/>
			))}
		</article>
	);
}
