import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { finishLayout } from './finishLayout';
import { launchNewsletterLayout } from './launchNewsletterLayout';

export const launchLayout: WizardLayout = {
	launchNewsletter: launchNewsletterLayout,
	cancel: cancelLayout,
	finish: finishLayout,
};
