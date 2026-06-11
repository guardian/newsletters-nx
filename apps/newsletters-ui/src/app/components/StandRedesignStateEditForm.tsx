import type { z } from 'zod';
import type { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
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
import type { NotedFields } from './StandRedesignWizard';

interface Props {
	formSchema: z.ZodObject<z.ZodRawShape>;
	formData: WizardFormData;
	setFormData: { (newData: WizardFormData): void };
	maxOptionsForRadioButtons?: number;
	stringConfig?: Partial<Record<string, StringInputSettings>>;
	notedFields?: NotedFields;
}

export const StandRedesignStateEditForm = ({
	formSchema,
	formData,
	setFormData,
	notedFields,
	maxOptionsForRadioButtons,
	stringConfig = {},
}: Props) => {
	const changeFormData = (value: FieldValue, field: FieldDef<typeof newsletterDataSchema.shape>) => {
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
			notedFields={notedFields}
			// ToDo: fix the types on the explanations prop so the keys are typed
			explanations={{
				regionFocus: 'Which region is this newsletter mainly designed for?',
				theme:
					'Choose the section the newsletter will live, for example "Football Daily" will go in the "Sport" pillar',
				group:
					'When a reader sees the newsletters in their account which, group should it be added to?',
				frequency:
					'How regularly will this newsletter land in reader’s inboxes?',
				name: 'What will readers call it?',
				category: 'What data will be used to populate *The newsletter*?',
				onlineArticle: 'Where will readers access the newsletter?',
				launchDate: 'When will the newsletter first send to readers?',
				signUpPageDate: 'When should promotions go live?',
				seriesTag: 'This is usually always the name of the newsletter and determines where it sits on the website.',
				seriesTagDescription: 'Reader facing, one sentence, description of what the newsletter is about ',
				composerTag: 'Add the newsletter name and then (newsletter sign up)',
			}}
			placeholders={{
				seriesTag: 'e.g Feast / Feast Newsletter',
				seriesTagDescription: 'e.g A weekly email about food news, trends and recipes',
				composerTag: 'Today In Focus (newsletter sign up)',
			}}
		/>
	);
};
