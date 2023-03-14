import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { formSchemas } from './formSchemas';

const markdownToDisplay = `
# Is there a design page?

You can include a link to the design for reference (optional)



`.trim();

export const descriptionLayout: WizardStepLayout = {
	staticMarkdown: markdownToDisplay,
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'pillar',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'designLink',
			onBeforeStepChangeValidate: (stepData: WizardStepData) => {
				const description: string | number | boolean | undefined =
					stepData.formData ? stepData.formData['description'] : undefined;
				if (!description) {
					return 'NO DESCRIPTION PROVIDED';
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.description,
};
