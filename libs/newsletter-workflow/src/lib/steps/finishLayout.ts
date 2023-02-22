import type { WizardStepLayout } from '@newsletters-nx/state-machine';

const markdownToDisplay = `# Finished

You have reached the end of the wizard.`;

const finishLayout: WizardStepLayout = {
	markdownToDisplay,
	buttons: {},
};

export { finishLayout };
