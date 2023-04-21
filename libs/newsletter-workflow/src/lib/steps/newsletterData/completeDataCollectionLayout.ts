import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeSkip } from '../../ececuteSkip';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Complete Data Collection

All the data required to create and launch **{{name}}** has now been specified.

Once you move beyond this page, you will no longer be able to make changes to the data, until you reach the **Testing** step.

To review or modify any values, please press **Back**.

Otherwise, press **Next** to proceed with the creation of **{{name}}**.

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const completeDataCollectionLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Complete Data Collection',
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
			stepToMoveTo: 'signUpEmbed',
			executeStep: executeModify,
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'emailCentralProduction',
			executeStep: executeModify,
		},
	},
	canSkipTo: true,
	executeSkip: executeSkip,
};
