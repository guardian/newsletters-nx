import { z } from 'zod';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';

const markdownToDisplay = `
# Promotion

Will the newsletters be promoted in advance or will promotion go live on the day of launch?

`.trim();

export const promotionDateLayout: WizardStepLayout = {
	staticMarkdown: markdownToDisplay,
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'back',
			stepToMoveTo: 'identityName',
		},
		next: {
			buttonType: 'GREEN',
			label: 'next',
			stepToMoveTo: 'finish',
		},
	},
	schema: z
		.object({
			signUpPageDate: z.coerce.date(),
			thrasherDate: z.coerce.date(),
		})
		.describe('choose the dates you want promotions to appear'),
};
