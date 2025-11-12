import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import type { WizardLayout } from '@newsletters-nx/state-machine';
import { brazeLayout } from './brazeLayout';
import { cancelLayout } from './cancelLayout';
import { doLaunchLayout } from './doLaunchLayout';
import { editBrazeLayout } from './editBrazeLayout';
import { editIdentityNameLayout } from './editIdentityNameLayout';
import { finishLayout } from './finishLayout';
import { identityNameLayout } from './identityNameLayout';
import { isDataCompleteLayout } from './isDataCompleteLayout';
import { launchNewsletterLayout } from './launchNewsletterLayout';
import { noItemLayout } from './noItem';

export const launchLayout: WizardLayout<LaunchService> = {
	launchNewsletter: launchNewsletterLayout,
	isDataComplete: isDataCompleteLayout,
	identityName: identityNameLayout,
	editIdentityName: editIdentityNameLayout,
	braze: brazeLayout,
	editBraze: editBrazeLayout,
	doLaunch: doLaunchLayout,
	noItem: noItemLayout,
	cancel: cancelLayout,
	finish: finishLayout,
};
