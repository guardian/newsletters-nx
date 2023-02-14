import { useState } from 'react';
import type { z } from 'zod';
import type { FieldDef, FieldValue } from './SchemaForm';
import { getModification, SchemaForm } from './SchemaForm';

interface Props<T extends z.ZodRawShape> {
	title: string;
	schema: z.ZodObject<T>;
	initalData: {
		[k in keyof z.objectUtil.addQuestionMarks<{
			[k in keyof T]: T[k]['_output'];
		}>]: z.objectUtil.addQuestionMarks<{
			[k in keyof T]: T[k]['_output'];
		}>[k];
	};
	submit: { (data: T): void };
}

export function SimpleForm<T extends z.ZodRawShape>({
	initalData,
	submit,
	title,
	schema,
}: Props<T>) {
	type SchemaContents = Props<T>['initalData'];

	const parseInitialDataResult = schema.safeParse(initalData);

	const parsedInitial = parseInitialDataResult.success
		? parseInitialDataResult.data
		: undefined;

	const [data, setData] = useState<SchemaContents | undefined>(parsedInitial);
	const [warnings, setWarnings] = useState<Partial<Record<keyof T, string>>>(
		{},
	);

	if (!data) {
		console.warn(parseInitialDataResult);
		return <>INITIAL DATA WAS INVALID</>;
	}

	const manageChange = (value: FieldValue, key: FieldDef) => {
		const mod = getModification(value, key);
		const revisedData: SchemaContents = {
			...data,
			...mod,
		};

		updateDataAndWarnings(revisedData);
	};

	const updateDataAndWarnings = (revisedData: SchemaContents) => {
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

	const reset = () => {
		updateDataAndWarnings(parsedInitial as SchemaContents);
	};

	return (
		<fieldset>
			<legend>{title}</legend>
			<button onClick={reset}>RESET</button>
			<SchemaForm
				schema={schema}
				data={data}
				changeValue={manageChange}
				validationWarnings={warnings}
			/>
			<button
				onClick={() => {
					const result = schema.safeParse(data);
					if (result.success) {
						return submit(result.data as T);
					}
					console.warn(result.error);
				}}
			>
				SUBMIT
			</button>
		</fieldset>
	);
}
