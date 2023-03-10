import type { WizardStepLayout } from '@newsletters-nx/state-machine';

const markdownToDisplay = `# Finished

You have reached the end of the wizard. The newsletter has been launched.
`.trim();

export const finishLayout: WizardStepLayout = {
	staticMarkdown: markdownToDisplay,
	buttons: {},
};
