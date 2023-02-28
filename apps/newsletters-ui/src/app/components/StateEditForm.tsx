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
				validationWarnings={{}}
				changeValue={changeFormData}
			/>
		</Paper>
	);
};
