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

type NewsletterDataShape = typeof newsletterDataSchema.shape;

interface Props {
	formSchema: typeof newsletterDataSchema;
	formData: WizardFormData;
	setFormData: { (newData: WizardFormData): void };
	maxOptionsForRadioButtons?: number;
	stringConfig?: Partial<Record<keyof NewsletterDataShape, StringInputSettings>>;
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
			explanations={{
				regionFocus: 'Which region is this newsletter mainly designed for?',
				frequency: 'How regularly will this newsletter land in reader’s inboxes?',
				name: 'What will readers call it?',
				category: 'What data will be used to populate *The newsletter*?',
				onlineArticle: 'Where will readers access the newsletter?',
				launchDate: 'When will the newsletter first send to readers?',
				signUpPageDate: 'When should promotions go live?',
				seriesTag: 'This is usually always the name of the newsletter and determines where it sits on the website.',
				seriesTagDescription: 'Reader facing, one sentence, description of what the newsletter is about ',
				composerTag: 'Add the newsletter name and then (newsletter sign up)',
				signUpHeadline: 'The larger text at the top of the newsletter sign up.',
				signUpDescription: 'The smaller text below the headline',
				illustrationCard: 'Search the grid for the 5:4 art work which will accompany the newsletter',
				mailSuccessDescription: 'The text a reader sees when they have signed up for a newsletter',
			}}
			placeholders={{
				seriesTag: 'e.g Feast / Feast Newsletter',
				seriesTagDescription: 'e.g A weekly email about food news, trends and recipes',
				composerTag: 'Today In Focus (newsletter sign up)',
				signUpHeadline: 'e.g Sign up for the First Edition newsletter: our free daily news email',
				signUpDescription: 'e.g Archie Bland and Nimo Omer take you through the top stories and what they mean.',
				mailSuccessDescription: 'e.g Subscription confirmed. We’ll send you First Edition every weekday.',
				illustrationCard: 'URL of the newsletter graphic 5:4',
				illustrationSquare: 'URL of the newsletter graphic 1:1'
			}}
		/>
	);
};
