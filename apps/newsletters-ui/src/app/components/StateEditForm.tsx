import { Paper } from '@mui/material';
import type { z } from 'zod';
import type { WizardFormData } from '@newsletters-nx/state-machine';
import type { FieldDef, FieldValue } from './SchemaForm';
import { getModification, SchemaForm } from './SchemaForm';
import { defaultFormStyle } from './SchemaForm/styling';

interface Props {
	formSchema: z.ZodObject<z.ZodRawShape>;
	formData: WizardFormData;
	setFormData: { (newData: WizardFormData): void };
}

const getValidationWarnings = (
	formSchema: z.ZodObject<z.ZodRawShape>,
	formData: WizardFormData,
): Partial<Record<string, string>> => {
	const parseResult = formSchema.safeParse(formData);
	const validationWarnings: Partial<Record<string, string>> = {};

	if (!parseResult.success) {
		parseResult.error.issues.forEach((issue) => {
			const { message, path, code } = issue;
			const key = typeof path[0] === 'string' ? path[0] : undefined;

			if (key) {
				validationWarnings[key] = message || code;
			}
		});
	}
	return validationWarnings;
};

export const StateEditForm = ({ formSchema, formData, setFormData }: Props) => {
	const changeFormData = (value: FieldValue, field: FieldDef) => {
		const mod = getModification(value, field);
		const revisedData = {
			...formData,
			...mod,
		};

		setFormData(revisedData);
	};

	return (
		<Paper css={defaultFormStyle} elevation={3}>
			<legend>{formSchema.description}</legend>
			<SchemaForm
				schema={formSchema}
				data={formData}
				validationWarnings={getValidationWarnings(formSchema, formData)}
				changeValue={changeFormData}
			/>
		</Paper>
	);
};
