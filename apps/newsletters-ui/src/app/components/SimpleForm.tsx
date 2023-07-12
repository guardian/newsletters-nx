import { Box, Button, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { z } from 'zod';
import type { FieldDef, FieldValue, StringInputSettings } from './SchemaForm';
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
	submitButtonText?: string;
	schema: z.ZodObject<T>;
	initialData: SchemaObjectType<T>;
	submit: { (data: SchemaObjectType<T>): void };
	isDisabled?: boolean;
	message?: ReactNode;
	maxOptionsForRadioButtons?: number;
	stringConfig?: Partial<Record<keyof T, StringInputSettings>>;
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
	initialData,
	submit,
	isDisabled,
	message,
	maxOptionsForRadioButtons,
	stringConfig = {},
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
		setParseInitialDataResult(schema.safeParse(initialData));
		if (parseInitialDataResult?.success) {
			setData(initialData);
		}
	}, [initialData, parseInitialDataResult?.success, schema, data]);

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
		if (!parseInitialDataResult || isDisabled) {
			return;
		}
		updateDataAndWarnings(parseInitialDataResult.data);
	};

	const handleSubmit = () => {
		if (isDisabled) {
			return;
		}
		const result = schema.safeParse(data);
		if (result.success) {
			return submit(result.data);
		}
		console.warn(result.error);
	};

	return (
		<Box
			elevation={3}
			padding={1}
			component={Paper}
			maxWidth={'sm'}
			marginBottom={1.5}
		>
			<Typography variant="h3" component={'legend'}>
				{title}
			</Typography>

			<Box marginBottom={2}>
				<Button variant="outlined" onClick={handleReset} disabled={isDisabled}>
					Reset
				</Button>
			</Box>

			<SchemaForm
				schema={schema}
				data={data}
				changeValue={manageChange}
				validationWarnings={warnings}
				readOnlyKeys={isDisabled ? Object.keys(schema.shape) : undefined}
				maxOptionsForRadioButtons={maxOptionsForRadioButtons}
				stringConfig={stringConfig}
			/>
			<Box marginBottom={2}>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={isDisabled}
				>
					{submitButtonText}
				</Button>
			</Box>
		</Box>
	);
}
