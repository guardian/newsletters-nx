import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `# Finished

You have reached the end of the wizard.

Congratulations - you've provided the key data for newsletter **{{name}}**.

You can see your draft on the [details page](drafts/{{listId}}), which includes the options to edit the data you have provided and provide additional details.

`;

const staticMarkdown = markdownTemplate.replace(regExPatterns.name, '');

const finishLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown: staticMarkdown,
	label: 'Finish',
	buttons: {},
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
};

export { finishLayout };
