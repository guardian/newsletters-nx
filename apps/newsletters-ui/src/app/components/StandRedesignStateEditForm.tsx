import type { z } from 'zod';
import { getValidationWarnings } from '@newsletters-nx/newsletters-data-client';
import type { WizardFormData } from '@newsletters-nx/state-machine';
import type {
	FieldDef,
	FieldValue,
	StringInputSettings,
} from './StandRedesignSchemaForm';
import {
	getModification,
	StandRedesignSchemaForm,
} from './StandRedesignSchemaForm';

interface Props {
	formSchema: z.ZodObject<z.ZodRawShape>;
	formData: WizardFormData;
	setFormData: { (newData: WizardFormData): void };
	maxOptionsForRadioButtons?: number;
	stringConfig?: Partial<Record<string, StringInputSettings>>;
}

export const StandRedesignStateEditForm = ({
	formSchema,
	formData,
	setFormData,
	maxOptionsForRadioButtons,
	stringConfig = {},
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
		<StandRedesignSchemaForm
			schema={formSchema}
			data={formData}
			validationWarnings={getValidationWarnings(formData, formSchema)}
			changeValue={changeFormData}
			maxOptionsForRadioButtons={maxOptionsForRadioButtons}
			stringConfig={stringConfig}
			// ToDo: fix the types on the explanations prop so the keys are typed
			explanations={{
				regionFocus: 'Which region is this newsletter mainly designed for?',
			}}
		/>
	);
};
