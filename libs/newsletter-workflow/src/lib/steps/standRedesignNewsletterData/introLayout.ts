import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import { getNextStepId } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';

export const createDraftIntro: WizardStepLayout<DraftService> = {
	staticMarkdown: `# Introduction

The below will guide you through in the first stage of creating a newsletter.

## Checklist before starting

 - **Name**: It’s best to have the name signed off before starting this flow. This allows the tags and system information to be most accurate.

## What happens next

 - **Central production** will take over the process of adding tags once you complete step 7.
 - **Rendering:** When Central Production’s work is complete you can set the rendering options for the newsletter. (Include where users can find the editing/rendering page within an individual newsletter page.)
 - **Design:** Visuals and branding will be required to launch so it’s best to have briefed editorial design.
 - **Promotion:** Once the newsletter is complete it can be prioritised and added to the all newsletters front.

## Guide for filling in the forms

 - There is a guide to help you set up the newsletter for some of the fields. If you see this icon :icon{symbol="text_snippet"} then there is a guide on the right (desktop view) or the bottom (tablet/mobile view) of the page.
 `,
	label: 'Introduction',
	buttons: {
		next: {
			buttonType: 'NEXT',
			label: 'Continue',
			stepToMoveTo: getNextStepId,
		},
	},
	role: 'CREATE_START',
};
