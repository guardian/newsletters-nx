import type { WizardLayout } from '@newsletters-nx/state-machine';
import { brazeLayout } from './brazeLayout';
import { cancelLayout } from './cancelLayout';
import { doLaunchLayout } from './doLaunchLayout';
import { editBrazeLayout } from './editBrazeLayout';
import { editIdentityNameLayout } from './editIdentityNameLayout';
import { editOphanLayout } from './editOphanLayout';
import { finishLayout } from './finishLayout';
import { identityNameLayout } from './identityNameLayout';
import { isDataCompleteLayout } from './isDataCompleteLayout';
import { launchNewsletterLayout } from './launchNewsletterLayout';
import { noItemLayout } from './noItem';
import { ophanLayout } from './ophanLayout';

export const launchLayout: WizardLayout = {
	launchNewsletter: launchNewsletterLayout,
	isDataComplete: isDataCompleteLayout,
	identityName: identityNameLayout,
	editIdentityName: editIdentityNameLayout,
	braze: brazeLayout,
	editBraze: editBrazeLayout,
	ophan: ophanLayout,
	editOphan: editOphanLayout,
	doLaunch: doLaunchLayout,
	noItem: noItemLayout,
	cancel: cancelLayout,
	finish: finishLayout,
};
