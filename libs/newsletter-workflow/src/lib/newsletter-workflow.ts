import type { WizardLayout } from '@newsletters-nx/state-machine';
import { brazeLayout } from './steps/brazeLayout';
import { cancelLayout } from './steps/cancelLayout';
import { createDraftNewsletterLayout } from './steps/createDraftNewsletterLayout';
import { descriptionLayout } from './steps/descriptionLayout';
import { editDraftNewsletterLayout } from './steps/editDraftNewsletterLayout';
import { finishLayout } from './steps/finishLayout';
import { identityNameLayout } from './steps/identityNameLayout';
import { ophanLayout } from './steps/ophanLayout';
import { pillarLayout } from './steps/pillarLayout';

export const newslettersWorkflowStepLayout: WizardLayout = {
	createDraftNewsletter: createDraftNewsletterLayout,
	editDraftNewsletter: editDraftNewsletterLayout,
	cancel: cancelLayout,
	identityName: identityNameLayout,
	braze: brazeLayout,
	ophan: ophanLayout,
	pillar: pillarLayout,
	description: descriptionLayout,
	finish: finishLayout,
};
