import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { finishLayout } from './finishLayout';
import { isReadyLayout } from './isReady';
import { launchNewsletterLayout } from './launchNewsletterLayout';
import { noItemLayout } from './noItem';

export const launchLayout: WizardLayout = {
	launchNewsletter: launchNewsletterLayout,
	isReady: isReadyLayout,
	noItem: noItemLayout,
	cancel: cancelLayout,
	finish: finishLayout,
};
