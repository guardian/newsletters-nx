import type { WizardLayout } from '@newsletters-nx/state-machine';
import { brazeLayout } from './brazeLayout';
import { cancelLayout } from './cancelLayout';
import { editBrazeLayout } from './editBrazeLayout';
import { editIdentityNameLayout } from './editIdentityNameLayout';
import { editOphanLayout } from './editOphanLayout';
import { finishLayout } from './finishLayout';
import { identityNameLayout } from './identityNameLayout';
import { isReadyLayout } from './isReady';
import { launchNewsletterLayout } from './launchNewsletterLayout';
import { noItemLayout } from './noItem';
import { ophanLayout } from './ophanLayout';

export const launchLayout: WizardLayout = {
	launchNewsletter: launchNewsletterLayout,
	isReady: isReadyLayout,
	identityName: identityNameLayout,
	editIdentityName: editIdentityNameLayout,
	braze: brazeLayout,
	editBraze: editBrazeLayout,
	ophan: ophanLayout,
	editOphan: editOphanLayout,
	noItem: noItemLayout,
	cancel: cancelLayout,
	finish: finishLayout,
};
