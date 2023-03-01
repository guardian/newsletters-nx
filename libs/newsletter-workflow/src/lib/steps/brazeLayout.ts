import { z } from 'zod/lib';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../executeModify';

const markdownToDisplay = `
# Modify Braze Values

These are tracking fields used by Braze.

They have been calculated automatically from the Name that you entered on a previous step of the wizard, but you can change them if you need.

`.trim();

export const brazeLayout: WizardStepLayout = {
	staticMarkdown: markdownToDisplay,
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'identityName',
			executeStep: executeModify,
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'ophan',
			onBeforeStepChangeValidate: () => {
				// TO DO - check that braze values do not already exist in other draft or actual newsletter
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: z
		.object({
			brazeSubscribeEventNamePrefix: z.string(),
			brazeNewsletterName: z.string(),
			brazeSubscribeAttributeName: z.string(),
			brazeSubscribeAttributeNameAlternate: z.string(),
		})
		.describe('Edit the Braze values if required'),
};
