import { useEffect, useState } from 'react';
import type { z } from 'zod';
import type { FieldDef, FieldValue } from './SchemaForm';
import { getModification, SchemaForm } from './SchemaForm';

type SchemaObjectType<T extends z.ZodRawShape> = {
	[k in keyof z.objectUtil.addQuestionMarks<{
		[k in keyof T]: T[k]['_output'];
	}>]: z.objectUtil.addQuestionMarks<{
		[k in keyof T]: T[k]['_output'];
	}>[k];
};

interface Props<T extends z.ZodRawShape> {
	title: string;
	schema: z.ZodObject<T>;
	initalData: SchemaObjectType<T>;
	submit: { (data: SchemaObjectType<T>): void };
}

/**
 * Component for rendering a controlled form based
 * on a ZodObject schema.
 *
 * If will only render all the fields correctly if they
 * are supported by the SchemaForm.
 * Nested object within the schema are not supported.
 */
export function SimpleForm<T extends z.ZodRawShape>({
	initalData,
	submit,
	title,
	schema,
}: Props<T>) {
	const [parseInitialDataResult, setParseInitialDataResult] = useState<
		z.SafeParseReturnType<typeof schema, SchemaObjectType<T>> | undefined
	>(undefined);
	const [data, setData] = useState<SchemaObjectType<T>>();
	const [warnings, setWarnings] = useState<Partial<Record<keyof T, string>>>(
		{},
	);

	useEffect(() => {
		setParseInitialDataResult(schema.safeParse(initalData));
		if (parseInitialDataResult?.success) {
			setData(initalData);
		}
	}, [initalData, parseInitialDataResult?.success, schema]);

	if (parseInitialDataResult && !parseInitialDataResult.success) {
		console.warn(parseInitialDataResult.error);
		return <>INITIAL DATA WAS INVALID</>;
	}

	if (!data) {
		return null;
	}

	const manageChange = (value: FieldValue, key: FieldDef) => {
		const mod = getModification(value, key);
		const revisedData: SchemaObjectType<T> = {
			...data,
			...mod,
		};

		updateDataAndWarnings(revisedData);
	};

	const updateDataAndWarnings = (revisedData: SchemaObjectType<T>) => {
		setWarnings({});
		const parseResult = schema.safeParse(revisedData);
		const issueMap: Partial<Record<keyof T, string>> = {};

		if (parseResult.success) {
			setData(parseResult.data as T);
		} else {
			parseResult.error.issues.forEach((issue) => {
				const { message, path, code } = issue;
				const key =
					typeof path[0] === 'string' ? (path[0] as keyof T) : undefined;

				if (key) {
					issueMap[key] = message || code;
				}
			});
		}
		setWarnings(issueMap);
	};

	const handleReset = () => {
		if (!parseInitialDataResult) {
			return;
		}
		updateDataAndWarnings(parseInitialDataResult.data);
	};

	const handleSubmit = () => {
		const result = schema.safeParse(data);
		if (result.success) {
			return submit(result.data);
		}
		console.warn(result.error);
	};

	return (
		<fieldset>
			<legend>{title}</legend>
			<button onClick={handleReset}>RESET</button>
			<SchemaForm
				schema={schema}
				data={data}
				changeValue={manageChange}
				validationWarnings={warnings}
			/>
			<button onClick={handleSubmit}>SUBMIT</button>
		</fieldset>
	);
}
