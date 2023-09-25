import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import { getNextStepId } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';

export const createDraftIntro: WizardStepLayout<DraftService> = {
	staticMarkdown: `# Introduction

	Welcome! This wizard will shortly guide you through the process of creating a newsletter. Here’s what you need to know:

	To set up a newsletter now, it’s best to have your confirmed newsletter name and sign up copy ready to go

	Contact the Editorial Design team to design your newsletter branding and thrashers

	Some of the work to promote the newsletter (e.g. placement on the all-newsletters page) will be picked up manually by other P&E teams

	As you follow the steps through to set up a new newsletter, you will see that some of the fields are optional. These are not essential to launch a newsletter

	Once the newsletter has been launched, you will be asked to set the rendering options for the newsletter. This will help you set up the newsletter template components e.g. the podcast section

	The wizard saves automatically and if you wish to exit the wizard, you can do so. The newsletter draft will be available for you to edit in future under the ‘Drafts’ section`,
	label: 'Welcome',
	buttons: {
		next: {
			buttonType: 'NEXT',
			label: 'Start',
			stepToMoveTo: getNextStepId,
		},
	},
	role: 'CREATE_START',
	canSkipTo: true,
};
