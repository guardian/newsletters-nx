import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';

const markdownToDisplay = `
# Cancelled

Setting the render options was cancelled.
`.trim();

export const cancelLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown: markdownToDisplay,
	buttons: {},
	role: 'EARLY_EXIT',
};
