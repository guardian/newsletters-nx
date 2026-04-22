import { Box, Paper, Typography } from '@mui/material';
import type { z } from 'zod';
import { getValidationWarnings } from '@newsletters-nx/newsletters-data-client';
import type { WizardFormData } from '@newsletters-nx/state-machine';
import type {
	FieldDef,
	FieldValue,
	StringCustomFieldComponent,
	StringInputSettings,
} from './SchemaForm';
import { getModification, SchemaForm } from './SchemaForm';

interface Props {
	formSchema: z.ZodObject<z.ZodRawShape>;
	formData: WizardFormData;
	setFormData: { (newData: WizardFormData): void };
	maxOptionsForRadioButtons?: number;
	stringConfig?: Partial<Record<string, StringInputSettings>>;
	customComponents?: Partial<Record<string, StringCustomFieldComponent>>;
}

export const StateEditForm = ({
	formSchema,
	formData,
	setFormData,
	maxOptionsForRadioButtons,
	stringConfig = {},
	customComponents = {},
}: Props) => {
	const changeFormData = (value: FieldValue, field: FieldDef) => {
		const mod = getModification(value, field);
		const revisedData = {
			...formData,
			...mod,
		};

		setFormData(revisedData);
	};

	return (
		<Box sx={{ padding: 1, marginBottom: 2.5 }} component={Paper} elevation={2}>
			<Typography variant="overline" component={'legend'}>
				{formSchema.description}
			</Typography>
			<SchemaForm
				schema={formSchema}
				data={formData}
				validationWarnings={getValidationWarnings(formData, formSchema)}
				changeValue={changeFormData}
				maxOptionsForRadioButtons={maxOptionsForRadioButtons}
				stringConfig={stringConfig}
				customComponents={customComponents}
			/>
		</Box>
	);
};
