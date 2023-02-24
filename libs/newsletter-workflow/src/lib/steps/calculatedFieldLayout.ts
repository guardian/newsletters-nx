import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../executeModify';

const markdownToDisplay = `
# Modify Calculated Fields

The following fields have been calculated from the Name that you entered on the previous step of the wizard.

`.trim();

export const calculatedFieldLayout: WizardStepLayout = {
	markdownToDisplay,
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'createNewsletter',
			executeStep: executeModify,
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'pillar',
			onBeforeStepChangeValidate: () => {
				// TO DO - check that identityName does not already exist in other draft or actual newsletter
				return undefined;
			},
			executeStep: executeModify,
		},
	},
};
