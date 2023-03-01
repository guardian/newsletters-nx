import { z } from 'zod';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../lib/executeModify';

const markdownToDisplay = `
# Modify Identity Name

This is a unique identifier for the newsletter, used internally by the system and not displayed to newsletter readers.

It has been calculated automatically from the Name that you entered on the previous step of the wizard, but you can change it if you need.

`.trim();

export const identityNameLayout: WizardStepLayout = {
	staticMarkdown: markdownToDisplay,
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
			stepToMoveTo: 'braze',
			onBeforeStepChangeValidate: () => {
				// TO DO - check that identityName does not already exist in other draft or actual newsletter
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: z
		.object({
			identityName: z.string(),
		})
		.describe('Edit the identity name if required'),
};
