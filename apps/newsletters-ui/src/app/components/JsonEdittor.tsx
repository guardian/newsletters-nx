import {
	Alert,
	Box,
	Button,
	ButtonGroup,
	Stack,
	TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { ZodObject, ZodRawShape } from 'zod';

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

const isValidJson = (value: string): boolean => {
	try {
		JSON.parse(value);
		return true;
	} catch (err) {
		return false;
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
		setFieldContents(event.target.value);
	};

	const checkJsonValidity = () => {
		setJsonCheckResult(isValidJson(fieldContents));
	};

	const checkSchema = () => {
		try {
			const data = JSON.parse(fieldContents) as JsonRecord;
			const result = schema.safeParse(data);

			setJsonCheckResult(true);
			if (result.success) {
				setSchemaCheckResult(true);
			} else {
				console.log(result.error);
				setSchemaCheckResult(false);
			}
		} catch (err) {
			setSchemaCheckResult(false);
			setJsonCheckResult(false);
		}
	};

	const reset = () => {
		setFieldContents(originalJson ?? '{}');
	};

	const handleSubmit = () => {
		checkJsonValidity();
		checkSchema();

		try {
			const output = schema.parse(JSON.parse(fieldContents) as JsonRecord);
			submit(output);
		} catch (err) {
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
			</Stack>
		</Box>
	);
};
