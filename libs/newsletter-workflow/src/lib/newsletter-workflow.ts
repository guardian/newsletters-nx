import type {
	WizardLayout,
} from '@newsletters-nx/state-machine';
import { cancelLayout } from './steps/cancelLayout';
import { createNewsletterLayout } from './steps/createNewsletterLayout';
import { finishLayout } from './steps/finishLayout';
import { newsletterNameLayout } from './steps/newsletterNameLayout';

export const newslettersWorkflowStepLayout: WizardLayout = {
	createNewsletter: createNewsletterLayout,
	cancel: cancelLayout,
	newsletterName: newsletterNameLayout,
	finish: finishLayout,
};
