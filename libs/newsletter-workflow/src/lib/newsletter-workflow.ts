import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout as cancelLaunchNewsletterLayout } from './steps/launchNewsletter/cancelLayout';
import { finishLayout as finishLaunchNewsletterLayout } from './steps/launchNewsletter/finishLayout';
import { launchDateLayout } from './steps/launchNewsletter/launchDateLayout';
import { launchNewsletterLayout } from './steps/launchNewsletter/launchNewsletterLayout';
import { brazeLayout } from './steps/newsletterData/brazeLayout';
import { cancelLayout as cancelNewsletterDataLayout } from './steps/newsletterData/cancelLayout';
import { createDraftNewsletterLayout } from './steps/newsletterData/createDraftNewsletterLayout';
import { descriptionLayout } from './steps/newsletterData/descriptionLayout';
import { editDraftNewsletterLayout } from './steps/newsletterData/editDraftNewsletterLayout';
import { finishLayout as finishNewsletterDataLayout } from './steps/newsletterData/finishLayout';
import { identityNameLayout } from './steps/newsletterData/identityNameLayout';
import { ophanLayout } from './steps/newsletterData/ophanLayout';
import { pillarLayout } from './steps/newsletterData/pillarLayout';

export const newslettersWorkflowStepLayout: Record<string, WizardLayout> = {
	NEWSLETTER_DATA: {
		createDraftNewsletter: createDraftNewsletterLayout,
		editDraftNewsletter: editDraftNewsletterLayout,
		cancel: cancelNewsletterDataLayout,
		identityName: identityNameLayout,
		braze: brazeLayout,
		ophan: ophanLayout,
		pillar: pillarLayout,
		description: descriptionLayout,
		finish: finishNewsletterDataLayout,
	},
	LAUNCH_NEWSLETTER: {
		launchNewsletter: launchNewsletterLayout,
		dates: launchDateLayout,
		cancel: cancelLaunchNewsletterLayout,
		finish: finishLaunchNewsletterLayout,
	},
};

export const getFormSchema = (
	wizardId: keyof typeof newslettersWorkflowStepLayout,
	stepId: string,
) => {
	const wizard = newslettersWorkflowStepLayout[wizardId];
	if (!wizard) {
		return undefined;
	}
	const step = wizard[stepId];
	return step?.schema;
};
