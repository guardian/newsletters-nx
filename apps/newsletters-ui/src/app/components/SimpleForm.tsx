import { Button, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import type { z } from 'zod';
import type { FieldDef, FieldValue } from './SchemaForm';
import { getModification, SchemaForm } from './SchemaForm';
import { defaultFieldStyle, defaultFormStyle } from './SchemaForm/styling';

type SchemaObjectType<T extends z.ZodRawShape> = {
	[k in keyof z.objectUtil.addQuestionMarks<{
		[k in keyof T]: T[k]['_output'];
	}>]: z.objectUtil.addQuestionMarks<{
		[k in keyof T]: T[k]['_output'];
	}>[k];
};

interface Props<T extends z.ZodRawShape> {
	title: string;
	submitButtonText?: string;
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
	title,
	submitButtonText = 'SUBMIT FORM',
	schema,
	initalData,
	submit,
}: Props<T>) {
	const [parseInitialDataResult, setParseInitialDataResult] = useState<
		z.SafeParseReturnType<typeof schema, SchemaObjectType<T>> | undefined
	>(undefined);
	const [data, setData] = useState<SchemaObjectType<T>>();
	const [warnings, setWarnings] = useState<Partial<Record<keyof T, string>>>(
		{},
	);

	// If data has not already been set and the initial data has not
	// already been found invalid, parse the initialData.
	// If initialData is valid, setData to initialData
	useEffect(() => {
		if (data || parseInitialDataResult?.success === false) {
			return;
		}
		setParseInitialDataResult(schema.safeParse(initalData));
		if (parseInitialDataResult?.success) {
			setData(initalData);
		}
	}, [initalData, parseInitialDataResult?.success, schema, data]);

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
		<Paper css={defaultFormStyle} elevation={3}>
			<legend>{title}</legend>

			<div css={defaultFieldStyle}>
				<Button variant="outlined" onClick={handleReset}>
					Reset
				</Button>
			</div>

			<SchemaForm
				schema={schema}
				data={data}
				changeValue={manageChange}
				validationWarnings={warnings}
			/>
			<div css={defaultFieldStyle}>
				<Button variant="contained" onClick={handleSubmit}>
					{submitButtonText}
				</Button>
			</div>
		</Paper>
	);
}
