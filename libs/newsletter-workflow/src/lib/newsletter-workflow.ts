import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './steps/cancelLayout';
import { createNewsletterLayout } from './steps/createNewsletterLayout';
import { descriptionLayout } from './steps/descriptionLayout';
import { finishLayout } from './steps/finishLayout';
import { pillarLayout } from './steps/pillarLayout';

export const newslettersWorkflowStepLayout: WizardLayout = {
	createNewsletter: createNewsletterLayout,
	cancel: cancelLayout,
	pillar: pillarLayout,
	description: descriptionLayout,
	finish: finishLayout,
};
