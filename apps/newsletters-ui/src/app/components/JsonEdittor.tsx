import {
	Alert,
	Box,
	Button,
	ButtonGroup,
	Stack,
	TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { ZodIssue, ZodObject, ZodRawShape } from 'zod';
import { ZodIssuesReport } from './ZodIssuesReport';

type JsonRecord = Record<string, unknown>;

interface Props {
	originalData: JsonRecord;
	schema: ZodObject<ZodRawShape>;
	submit: { (data: JsonRecord): void };
}

const getJsonString = (
	data: JsonRecord,
): { ok: true; json: string } | { ok: false } => {
	try {
		const json = JSON.stringify(data, undefined, 2);
		return { json, ok: true };
	} catch (err) {
		return { ok: false };
	}
};

const safeJsonParse = (value: string): JsonRecord | undefined => {
	try {
		const record = JSON.parse(value) as JsonRecord;
		return record;
	} catch (err) {
		return undefined;
	}
};

const maybeBoolToString = (value: boolean | undefined) => {
	switch (value) {
		case undefined:
			return 'not checked';
		case true:
			return 'YES';
		case false:
			return 'NO';
	}
};

const CheckResultMessage = (props: {
	result: boolean | undefined;
	label: string;
}) => {
	return (
		<Box>
			<Alert
				severity={
					props.result === undefined
						? 'warning'
						: !props.result
						? 'error'
						: 'success'
				}
			>
				{props.label}: {maybeBoolToString(props.result)}
			</Alert>
		</Box>
	);
};

export const JsonEdittor = ({ originalData, schema, submit }: Props) => {
	const [originalJson, setOriginalJson] = useState<string | undefined>();
	const [fieldContents, setFieldContents] = useState<string>('');
	const [jsonCheckResult, setJsonCheckResult] = useState<boolean | undefined>();
	const [schemaCheckResult, setSchemaCheckResult] = useState<
		boolean | undefined
	>();
	const [schemaCheckIssues, setSchemaCheckIssues] = useState<ZodIssue[]>([]);

	useEffect(() => {
		const stringifyResult = getJsonString(originalData);

		if (stringifyResult.ok) {
			setOriginalJson(stringifyResult.json);
			setFieldContents(stringifyResult.json);
		}
	}, [originalData]);

	const handleInput = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setJsonCheckResult(undefined);
		setSchemaCheckResult(undefined);
		setSchemaCheckIssues([]);
		setFieldContents(event.target.value);
	};

	const checkJsonValidity = () => {
		setJsonCheckResult(!!safeJsonParse(fieldContents));
	};

	const checkSchema = () => {
		const data = safeJsonParse(fieldContents);
		if (!data) {
			setSchemaCheckResult(false);
			setSchemaCheckIssues([]);
			setJsonCheckResult(false);
			return;
		}

		setJsonCheckResult(true);

		const result = schema.safeParse(data);
		if (!result.success) {
			setSchemaCheckResult(true);
			setSchemaCheckIssues([]);
			return;
		}

		setSchemaCheckResult(true);
		setSchemaCheckIssues([]);
	};

	const reset = () => {
		setFieldContents(originalJson ?? '{}');
	};

	const handleSubmit = () => {
		checkJsonValidity();
		checkSchema();
		try {
			const output = schema.parse(safeJsonParse(fieldContents));
			submit(output);
		} catch (err) {
			console.warn('submit fail');
			console.log(err);
		}
	};

	return (
		<Box>
			<TextField
				spellCheck={false}
				multiline
				value={fieldContents}
				onChange={(event) => handleInput(event)}
				fullWidth
			/>

			<ButtonGroup sx={{ marginY: 2 }}>
				<Button variant="outlined" onClick={reset}>
					reset
				</Button>
				<Button variant="outlined" onClick={checkJsonValidity}>
					check valid
				</Button>
				<Button variant="outlined" onClick={checkSchema}>
					check against schema
				</Button>
				<Button variant="contained" onClick={handleSubmit}>
					submit
				</Button>
			</ButtonGroup>

			<Stack maxWidth={'sm'} spacing={1} marginY={2}>
				<CheckResultMessage label="IS VALID JSON" result={jsonCheckResult} />
				<CheckResultMessage label="passes schema" result={schemaCheckResult} />
				<ZodIssuesReport issues={schemaCheckIssues} />
			</Stack>
		</Box>
	);
};
