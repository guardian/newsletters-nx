import type { DraftService } from '@newsletters-nx/newsletters-data-client';
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
## Choose the Pillar and Group for {{name}}

Please select a pillar (a section category) for **{{name}}** e.g. "*Football Daily*" sits under the *Sport* pillar.

![Pillars](https://i.guim.co.uk/img/uploads/2023/02/21/pillarScreenshot.png?quality=85&dpr=2&width=300&s=0692a8714eaf66313fc599cb3462befd)

Please then select a group for **{{name}}** to be listed under on the [Manage My Account](https://manage.theguardian.com/email-prefs) page e.g. *News in Depth*.

![Groups](https://i.guim.co.uk/img/uploads/2023/09/11/mma-screenshot.png?quality=85&dpr=2&width=300&s=1b7e49ebb42e9ac563da1f2afedf1c88)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const pillarAndGroupLayout: WizardStepLayout<DraftService> = {
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
			label: 'Back to previous step',
			stepToMoveTo: getPreviousOrStartStepId,
			executeStep: executeSkip,
		},
		finish: {
			buttonType: 'NEXT',
			label: 'Save and Continue',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
	},
	schema: formSchemas.pillarAndGroup,
	canSkipTo: true,
	executeSkip: executeSkip,
};
