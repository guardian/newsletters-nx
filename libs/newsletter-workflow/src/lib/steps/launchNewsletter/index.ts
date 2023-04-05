import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { finishLayout } from './finishLayout';
import { launchNewsletterLayout } from './launchNewsletterLayout';
import { noItemLayout } from './noItem';

export const launchLayout: WizardLayout = {
	launchNewsletter: launchNewsletterLayout,
	noItem: noItemLayout,
	cancel: cancelLayout,
	finish: finishLayout,
};
