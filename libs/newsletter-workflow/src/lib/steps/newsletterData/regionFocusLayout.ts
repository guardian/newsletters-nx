import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { goToNextNormalStep } from '@newsletters-nx/state-machine';
import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Choose the Geo Focus for {{name}}

Is **{{name}}** specific to a UK, Australia or US audience, or does it have international appeal?

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const regionFocusLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Geo Focus',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
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
			stepToMoveTo: goToNextNormalStep,
			onBeforeStepChangeValidate: (stepData: WizardStepData) => {
				const regionFocus = stepData.formData
					? stepData.formData['regionFocus']
					: undefined;
				if (!regionFocus || regionFocus === '') {
					return 'NO REGION FOCUS SELECTED';
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.regionFocus,
};
