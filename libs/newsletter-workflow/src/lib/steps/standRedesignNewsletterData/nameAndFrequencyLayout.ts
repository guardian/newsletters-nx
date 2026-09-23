import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import { getNextStepId } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getDraftFromStorage } from '../../getDraftFromStorage';
import { formSchemas } from './formSchemas';

/**
 * The entry point step for both the "create a new draft" and "edit an
 * existing draft" journeys - both ask for the same name & frequency
 * fields, so a single step covers both. `getInitialFormData` pre-fills
 * the fields from storage when editing an existing draft, and returns
 * an empty object (leaving the fields blank) when there is no existing
 * draft to load.
 */
export const nameAndFrequencyLayout: WizardStepLayout<
	DraftService,
	typeof formSchemas.nameAndFrequency.shape
> = {
	staticMarkdown: `# Name and frequency
`,

	staticSideMarkdown: [
		{
			markdown: `## :icon{symbol="text_snippet"}  Frequency

The frequency you specify will be shown on the sign up page, and on the all newsletters page.

![Frequency](https://i.guim.co.uk/img/uploads/2023/09/15/frequency.png?quality=85&dpr=2&width=300&s=e8c4bdd12b9c2f1f48d35a2d9b1ef1c7)
`,
			field: 'frequency',
		},
	],
	label: 'Name & frequency',
	buttons: {
		cancel: {
			buttonType: 'CANCEL',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'NEXT',
			label: 'Save and continue',
			stepToMoveTo: getNextStepId,
		},
	},
	schema: formSchemas.nameAndFrequency,
	role: 'START',
	getInitialFormData: getDraftFromStorage,
	canSkip: true,
};
