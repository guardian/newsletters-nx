import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';

const markdownToDisplay = `
## Cancelled

Launch of the newsletter was cancelled.
`.trim();

export const cancelLayout: WizardStepLayout<LaunchService> = {
	staticMarkdown: markdownToDisplay,
	buttons: {},
	role: 'EARLY_EXIT',
};
