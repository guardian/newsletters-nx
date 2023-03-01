import type { WizardStepLayout } from '@newsletters-nx/state-machine';

const markdownToDisplay = `
# Cancelled

Creation of the newsletter was cancelled.
`.trim();

export const cancelLayout: WizardStepLayout = {
	staticMarkdown: markdownToDisplay,
	buttons: {},
};
