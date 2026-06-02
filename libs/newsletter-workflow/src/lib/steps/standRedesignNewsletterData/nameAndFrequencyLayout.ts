import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import { getNextStepId } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { formSchemas } from './formSchemas';

export const nameAndFrequencyLayout: WizardStepLayout<DraftService, typeof formSchemas.nameAndFrequency.shape> = {
	staticMarkdown: `# Enter the newsletter's name

The first step is to enter the name of your newsletter. For example,  **Down to Earth**.

`,

	staticSideMarkdown: [{ markdown: `### Frequency

The frequency you specify will be shown on the sign up page, and on the all newsletters page.

![Frequency](https://i.guim.co.uk/img/uploads/2023/09/15/frequency.png?quality=85&dpr=2&width=300&s=e8c4bdd12b9c2f1f48d35a2d9b1ef1c7)
`, field: 'frequency' }],
	label: 'Name & frequency',
	buttons: {
		cancel: {
			buttonType: 'CANCEL',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'NEXT',
			label: 'Save and Continue',
			stepToMoveTo: getNextStepId,
		},
	},
	schema: formSchemas.nameAndFrequency,
	canSkipTo: true,
	skippingWillPersistLocalChanges: true,
};
