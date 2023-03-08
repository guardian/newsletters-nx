import type { WizardStepLayout } from '@newsletters-nx/state-machine';

const markdownToDisplay = `
# Cancelled

Collection of newsletter data was cancelled.
`.trim();

export const cancelLayout: WizardStepLayout = {
	staticMarkdown: markdownToDisplay,
	buttons: {},
};
