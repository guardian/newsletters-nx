import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { goToNextNormalStep } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getDraftFromStorage } from '../../getDraftFromStorage';

export const startLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown: `# Set Rendering Template Options

This wizard is to choose the options for how an article-based newsletter will appear in Email-rendering.

You do **not need to complete** this wizard for **fronts-based newsletters or newsletters that do not use Email-rendering**.

`,
	label: 'Start',
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: goToNextNormalStep,
		},
	},
	role: 'EDIT_START',
	getInitialFormData: getDraftFromStorage,
	executeSkip: executeModify,
};
