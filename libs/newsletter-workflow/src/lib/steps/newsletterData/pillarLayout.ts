import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { goToNextNormalStep } from '@newsletters-nx/state-machine';
import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Choose the Pillar for {{name}}

Select a pillar for the newsletter e.g. **Football Daily** sits under the **Sport** pillar.

![Pillars](https://i.guim.co.uk/img/uploads/2023/02/21/pillarScreenshot.png?quality=85&dpr=2&width=300&s=0692a8714eaf66313fc599cb3462befd)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const pillarLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Pillar',
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
			stepToMoveTo: 'dates',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: goToNextNormalStep,
			onBeforeStepChangeValidate: (stepData: WizardStepData) => {
				const theme = stepData.formData
					? stepData.formData['theme']
					: undefined;
				if (!theme || theme === '') {
					return 'NO THEME SELECTED';
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.pillar,
	canSkipTo: true,
	executeSkip: executeSkip,
};
