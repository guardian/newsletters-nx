import { z } from 'zod';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';

export const promotionDateLayout: WizardStepLayout = {
	staticMarkdown: `# Promotion

	choose below

`,
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
		.describe('choose dates'),
};
