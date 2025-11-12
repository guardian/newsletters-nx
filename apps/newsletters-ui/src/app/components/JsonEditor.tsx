import {
	Alert,
	Box,
	Button,
	ButtonGroup,
	Container,
	Grid,
	Stack,
	TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { Schema, ZodIssue } from 'zod';
import { ZodIssuesReport } from './ZodIssuesReport';

type JsonRecordOrArray = Record<string, unknown> | unknown[];

interface Props<T extends JsonRecordOrArray> {
	originalData: T;
	schema: Schema<T>;
	submit: { (data: T): void | Promise<void> };
}

const getFormattedJsonString = (
	data: JsonRecordOrArray,
): { ok: true; json: string } | { ok: false } => {
	try {
		const json = JSON.stringify(data, undefined, 4);
		return { json, ok: true };
	} catch (err) {
		return { ok: false };
	}
};

const safeJsonParse = (value: string): JsonRecordOrArray | undefined => {
	try {
		return JSON.parse(value) as JsonRecordOrArray;
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

export const JsonEditor = <T extends JsonRecordOrArray>({
	originalData,
	schema,
	submit,
}: Props<T>) => {
	const [originalJson, setOriginalJson] = useState<string | undefined>();
	const [fieldContents, setFieldContents] = useState<string>('');
	const [jsonCheckResult, setJsonCheckResult] = useState<boolean | undefined>();
	const [schemaCheckResult, setSchemaCheckResult] = useState<
		boolean | undefined
	>();
	const [schemaCheckIssues, setSchemaCheckIssues] = useState<ZodIssue[]>([]);

	useEffect(() => {
		const stringifyResult = getFormattedJsonString(originalData);

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
		console.log(result);
		if (!result.success) {
			setSchemaCheckResult(false);
			setSchemaCheckIssues(result.error.issues);
			return;
		}

		setSchemaCheckResult(true);
		setSchemaCheckIssues([]);
	};

	const reset = () => {
		setFieldContents(originalJson ?? '{}');
	};

	const handleSubmit = async () => {
		checkJsonValidity();
		checkSchema();
		try {
			const output = schema.parse(safeJsonParse(fieldContents));
			await submit(output);
		} catch (err) {
			console.warn('submit fail');
			console.log(err);
		}
	};

	const formatContents = () => {
		const data = safeJsonParse(fieldContents);
		if (!data) {
			setJsonCheckResult(false);
			return;
		}
		const formatted = getFormattedJsonString(data);

		if (!formatted.ok) {
			setJsonCheckResult(false);
			return;
		}

		setJsonCheckResult(true);
		setFieldContents(formatted.json);
	};

	return (
		<Box>
			<Grid container>
				<Grid item xs={12} md={3}>
					<Container>
						<ButtonGroup sx={{ marginY: 2 }} orientation="vertical" fullWidth>
							<Button variant="outlined" onClick={reset} color="warning">
								reset
							</Button>
							<Button variant="outlined" onClick={formatContents}>
								format
							</Button>
							<Button variant="outlined" onClick={checkJsonValidity}>
								check valid
							</Button>
							<Button variant="outlined" onClick={checkSchema}>
								check against schema
							</Button>
						</ButtonGroup>

						<Stack spacing={1} marginY={2}>
							<CheckResultMessage
								label="IS VALID JSON"
								result={jsonCheckResult}
							/>
							<CheckResultMessage
								label="passes schema"
								result={schemaCheckResult}
							/>
							<ZodIssuesReport issues={schemaCheckIssues} />
						</Stack>
					</Container>
				</Grid>
				<Grid item xs={12} md={9}>
					<TextField
						spellCheck={false}
						multiline
						value={fieldContents}
						onChange={(event) => handleInput(event)}
						fullWidth
					/>
				</Grid>
			</Grid>

			<Container maxWidth="md" sx={{ marginTop: 3 }}>
				<Button
					variant="contained"
					onClick={() => void handleSubmit()}
					fullWidth
					size="large"
				>
					submit
				</Button>
			</Container>
		</Box>
	);
};
