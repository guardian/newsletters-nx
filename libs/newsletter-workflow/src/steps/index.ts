import type { WizardLayout } from '@newsletters-nx/state-machine';
import { brazeLayout } from './brazeLayout';
import { cancelLayout } from './cancelLayout';
import { createNewsletterLayout } from './createNewsletterLayout';
import { descriptionLayout } from './descriptionLayout';
import { finishLayout } from './finishLayout';
import { identityNameLayout } from './identityNameLayout';
import { ophanLayout } from './ophanLayout';
import { pillarLayout } from './pillarLayout';

export const newslettersWorkflowStepLayout: WizardLayout = {
	createNewsletter: createNewsletterLayout,
	cancel: cancelLayout,
	identityName: identityNameLayout,
	braze: brazeLayout,
	ophan: ophanLayout,
	pillar: pillarLayout,
	description: descriptionLayout,
	finish: finishLayout,
};
