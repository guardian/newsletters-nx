import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
## Thrasher requests for {{name}}

If you would like to request a thrasher be created, please tick the "Single thrasher required?" and add the detials below. The description will appear as shown belowxs:

![Thrasher description](https://i.guim.co.uk/img/uploads/2023/05/16/single-thrasher.png?quality=85&dpr=2&width=300&s=d30c77a6c732f5e85af3e11318128f2e)

You can also request new  multi-thrashers which promote more than one newsletter. For each request, click "Add New Item" below add the names of the newsletters it should promote. For example, the thrasher shown below promotes:
 - Five Great Reads
 - Morning Mail
 - Afternoon Update

![Multi-Thrasher](https://i.guim.co.uk/img/uploads/2023/05/04/multi-thrasher.png?quality=85&dpr=2&width=300&s=3bafd0d04fd91b94b8a0fc86efd2160f)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const thrashersLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Thrasher Requests',
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
			stepToMoveTo: getPreviousOrEditStartStepId,
			executeStep: executeSkip,
		},
		next: {
			buttonType: 'NEXT',
			label: 'Save and Continue',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
	},
	schema: formSchemas.thrashers,
	fieldDisplayOptions: {
		'thrasherOptions.thrasherDescription': {
			textArea: true,
		},
	},
	canSkipTo: true,
	executeSkip: executeSkip,
};
