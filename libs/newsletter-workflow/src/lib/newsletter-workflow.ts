import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './steps/cancelLayout';
import { createNewsletterLayout } from './steps/createNewsletterLayout';
import { descriptionLayout } from './steps/description';
import { finishLayout } from './steps/finishLayout';
import { pillarLayout } from './steps/pillar';

export const newslettersWorkflowStepLayout: WizardLayout = {
	createNewsletter: createNewsletterLayout,
	cancel: cancelLayout,
	pillar: pillarLayout,
	description: descriptionLayout,
	finish: finishLayout,
};
