import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `# Finished

You have reached the end of the wizard.

Congratulatoions - the newsletter **{{name}}** has been launched.

`;

const staticMarkdown = markdownTemplate.replace(regExPatterns.name, '');

const finishLayout: WizardStepLayout = {
	staticMarkdown: staticMarkdown,
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
