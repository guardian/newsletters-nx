import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';

const markdownToDisplay = `
## Cancelled

Collection of newsletter data was cancelled.
`.trim();

export const cancelLayout: WizardStepLayout<DraftService> = {
	staticMarkdown: markdownToDisplay,
	buttons: {},
	role: 'EARLY_EXIT',
};
