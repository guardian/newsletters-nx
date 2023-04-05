import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `# Finished

You have reached the end of the wizard.

Congratulations - the rendering options for **{{name}}** have been set.

Go to the [details page](newsletters/drafts/{{listId}}) to see your draft.

`;

const staticMarkdown = markdownTemplate.replace(regExPatterns.name, '');

const finishLayout: WizardStepLayout = {
	staticMarkdown: staticMarkdown,
	label: 'Finish',
	buttons: {},
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		const [listId = 'listId'] = getStringValuesFromRecord(responseData, [
			'listId',
		]);
		return markdownTemplate
			.replace(regExPatterns.name, name)
			.replace(regExPatterns.listId, listId);
	},
};

export { finishLayout };
