import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../getValuesFromRecord';

const markdownTemplate = `# Finished

You have reached the end of the wizard. The draft newsletter **{{name}}** has been created.`;

const staticMarkdown = markdownTemplate.replace('{{name}}', '');

const finishLayout: WizardStepLayout = {
	staticMarkdown: staticMarkdown,
	buttons: {},
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace('{{name}}', name);
	},
};

export { finishLayout };
