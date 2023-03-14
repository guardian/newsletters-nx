import { z } from 'zod';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';

export const launchDateLayout: WizardStepLayout = {
	staticMarkdown: `# Choose launch date

	choose below

`,
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'back',
			stepToMoveTo: 'launchNewsletter',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Finish',
			stepToMoveTo: 'finish',
		},
	},
	schema: z
		.object({
			launchDate: z.coerce.date(),
			thrasherDate: z.coerce.date(),
		})
		.describe('choose dates'),
};
