import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import {
	getNextStepId,
	getPreviousOrStartStepId,
} from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Choose the Pillar and Group for {{name}}

Select a pillar for the newsletter e.g. **Football Daily** sits under the **Sport** pillar.

![Pillars](https://i.guim.co.uk/img/uploads/2023/02/21/pillarScreenshot.png?quality=85&dpr=2&width=300&s=0692a8714eaf66313fc599cb3462befd)

Select a group for the {{name}} to be listed under on the [All Newsletters Page](https://www.theguardian.com/email-newsletters). The current groups are:
 - News in depth
 - News in brief
 - Opinion
 - Features
 - Culture
 - Lifestyle
 - Sport
 - Work
 - From the papers

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const pillarAndGroupLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Pillar and Group',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
	buttons: {
		back: {
			buttonType: 'PREVIOUS',
			label: 'Back',
			stepToMoveTo: getPreviousOrStartStepId,
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
	},
	schema: formSchemas.pillarAndGroup,
	canSkipTo: true,
	executeSkip: executeSkip,
};
