import type { WizardStepLayout } from '@newsletters-nx/state-machine';

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
		const { name = '' } = responseData;
		if (typeof name !== 'string') {
			return staticMarkdown;
		}

		return markdownTemplate.replace('{{name}}', name);
	},
};

export { finishLayout };
