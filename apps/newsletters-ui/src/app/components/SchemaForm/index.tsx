import type { z } from 'zod';
import { SchemaField } from './SchemaField';

export interface FieldDef {
	key: string;
	optional: boolean;
	type: string;
	value: unknown;
	enumOptions?: string[];
}
export type FieldValue = string | number | boolean | undefined;

export type NumberInputSettings = {
	min?: number;
	max?: number;
	step?: number;
};

interface Props<T extends z.ZodRawShape> {
	schema: z.ZodObject<T>;
	data: Record<string, unknown>;
	changeValue: { (value: FieldValue, field: FieldDef): void };
	options?: Partial<Record<keyof T, string[]>>;
	optionDescriptions?: Partial<Record<keyof T, string[]>>;
	suggestions?: Partial<Record<keyof T, string[]>>;
	numberConfig?: Partial<Record<keyof T, NumberInputSettings>>;
	showUnsupported?: boolean;
}

function fieldValueIsRightType(value: FieldValue, field: FieldDef): boolean {
	if (field.type === 'ZodEnum') {
		return field.enumOptions?.includes(value as string) ?? false;
	}
	switch (typeof value) {
		case 'undefined':
			return field.optional;
		case 'string':
			return field.type === 'ZodString';
		case 'number':
			return field.type === 'ZodNumber';
		case 'boolean':
			return field.type === 'ZodBoolean';
		default:
			return false;
	}
}

export function getModification(
	value: FieldValue,
	field: FieldDef,
): Record<string, FieldValue> {
	if (fieldValueIsRightType(value, field)) {
		const mod: Record<string, FieldValue> = {};
		mod[field.key] = value;
		return mod;
	}
	return {};
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
	optionDescriptions = {},
	numberConfig = {},
	suggestions = {},
	showUnsupported = false,
}: Props<T>) {
	const fields: FieldDef[] = [];
	for (const key in schema.shape) {
		const zod = schema.shape[key];
		if (!zod) {
			return null;
		}

		let type: string;
		if (zod.isOptional()) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- zod
			type = zod._def.innerType._def.typeName as unknown as string;
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- zod
			type = zod._def.typeName as unknown as string;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- zod
		const enumOptions =
			zod._def.typeName === 'ZodEnum'
				? (zod._def.values as unknown as string[])
				: undefined;

		fields.push({
			key,
			optional: zod.isOptional(),
			type,
			value: data[key],
			enumOptions,
		});
	}

	return (
		<article>
			{fields.map((field) => (
				<SchemaField
					key={field.key}
					noTriState
					options={options[field.key]}
					optionDescriptions={optionDescriptions[field.key]}
					suggestions={suggestions[field.key]}
					numberInputSettings={numberConfig[field.key]}
					change={changeValue}
					field={field}
					showUnsupported={showUnsupported}
					stringInputType={field.key === 'text' ? 'textArea' : undefined}
				/>
			))}
		</article>
	);
}
