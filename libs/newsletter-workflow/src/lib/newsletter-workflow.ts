import type { WizardLayout } from '@newsletters-nx/state-machine';
import { brazeLayout } from './steps/brazeLayout';
import { cancelLayout } from './steps/cancelLayout';
import { createNewsletterLayout } from './steps/createNewsletterLayout';
import { descriptionLayout } from './steps/descriptionLayout';
import { editDraftNewsletterLayout } from './steps/editDraftNewsletter';
import { finishLayout } from './steps/finishLayout';
import { identityNameLayout } from './steps/identityNameLayout';
import { ophanLayout } from './steps/ophanLayout';
import { pillarLayout } from './steps/pillarLayout';

export const newslettersWorkflowStepLayout: WizardLayout = {
	createNewsletter: createNewsletterLayout,
	editDraftNewsletter: editDraftNewsletterLayout,
	cancel: cancelLayout,
	identityName: identityNameLayout,
	braze: brazeLayout,
	ophan: ophanLayout,
	pillar: pillarLayout,
	description: descriptionLayout,
	finish: finishLayout,
};
