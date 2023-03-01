import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../lib/getValuesFromRecord';
import { regExPatterns } from '../lib/regExPatterns';

const markdownTemplate = `# Finished

You have reached the end of the wizard. The draft newsletter **{{name}}** has been created.`;

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
