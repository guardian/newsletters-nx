import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../executeModify';

const markdownToDisplay = `
# Modify Ophan Campaign Values

These are tracking fields used by Ophan.

They have been calculated automatically from the Name that you entered on a previous step of the wizard, but you can change them if you need.

`.trim();

export const ophanLayout: WizardStepLayout = {
	markdownToDisplay,
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'braze',
			executeStep: executeModify,
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'pillar',
			onBeforeStepChangeValidate: () => {
				// TO DO - check that ophan values do not already exist in other draft or actual newsletter
				return undefined;
			},
			executeStep: executeModify,
		},
	},
};
