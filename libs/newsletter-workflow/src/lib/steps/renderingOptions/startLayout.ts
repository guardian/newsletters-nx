import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getNextStepId } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getDraftFromStorage } from '../../getDraftFromStorage';

export const startLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown: `## Set Rendering Template Options

This wizard is to choose the options for how an article-based newsletter will appear in Email-rendering.

`,
	label: 'Start',
	buttons: {
		cancel: {
			buttonType: 'CANCEL',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
		},
	},
	role: 'EDIT_START',
	getInitialFormData: getDraftFromStorage,
	executeSkip: executeModify,
};
