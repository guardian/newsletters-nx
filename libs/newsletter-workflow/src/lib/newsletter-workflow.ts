import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './steps/cancelLayout';
import { createNewsletterLayout } from './steps/createNewsletterLayout';
import { finishLayout } from './steps/finishLayout';
import { pillarLayout } from './steps/pillar';
import { signUpHeadlineLayout } from './steps/signUpHeadline';

export const newslettersWorkflowStepLayout: WizardLayout = {
	createNewsletter: createNewsletterLayout,
	cancel: cancelLayout,
	pillar: pillarLayout,
	signUpHeadline: signUpHeadlineLayout,
	finish: finishLayout,
};
