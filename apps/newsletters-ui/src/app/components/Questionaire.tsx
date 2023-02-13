import { useState } from 'react';
import type { Questionaire } from '@newsletters-nx/newsletters-data-client';
import { questionaireSchema } from '@newsletters-nx/newsletters-data-client';
import type { FieldDef, FieldValue } from './SchemaForm';
import { getModification, SchemaForm } from './SchemaForm';

type Props = {
	title: string;
	initalData: Questionaire;
	submit: { (data: Questionaire): void };
};

export function QuestionaireForm({ initalData, submit, title }: Props) {
	const [data, setData] = useState<Questionaire>(initalData);
	const [warnings, setWarnings] = useState<
		Partial<Record<keyof Questionaire, string>>
	>({});

	const manageChange = (value: FieldValue, key: FieldDef) => {
		const mod = getModification(value, key);
		const revisedData = {
			...data,
			...mod,
		};

		updateDataAndWarnings(revisedData);
	};

	const updateDataAndWarnings = (
		revisedData: Partial<Record<keyof Questionaire, unknown>>,
	) => {
		setWarnings({});
		const parseResult = questionaireSchema.safeParse(revisedData);
		const issueMap: Partial<Record<keyof Questionaire, string>> = {};

		if (parseResult.success) {
			setData(parseResult.data);
		} else {
			parseResult.error.issues.forEach((issue) => {
				const { message, path, code } = issue;
				const key =
					typeof path[0] === 'string'
						? (path[0] as keyof Questionaire)
						: undefined;

				if (key) {
					issueMap[key] = message || code;
				}
			});
		}
		setWarnings(issueMap);
	};

	const reset = () => {
		updateDataAndWarnings(initalData);
	};

	return (
		<div>
			<p>{title}</p>
			<button onClick={reset}>RESET</button>
			<SchemaForm
				schema={questionaireSchema}
				data={data}
				changeValue={manageChange}
				validationWarnings={warnings}
			/>
			<button
				onClick={() => {
					submit(data);
				}}
			>
				SUBMIT
			</button>
		</div>
	);
}
