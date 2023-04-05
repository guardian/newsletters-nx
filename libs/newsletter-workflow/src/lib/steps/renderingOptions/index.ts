import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { finishLayout } from './finishLayout';
import { footerLayout } from './footerLayout';
import { imageLayout } from './imageLayout';
import { linkListLayout } from './linkListLayout';
import { newsletterHeaderLayout } from './newsletterHeaderLayout';
import { podcastLayout } from './podcastLayout';
import { readMoreLayout } from './readMoreLayout';
import { startLayout } from './start';

export const renderingOptionsLayout: WizardLayout = {
	start: startLayout,
	cancel: cancelLayout,
	newsletterHeader: newsletterHeaderLayout,
	image: imageLayout,
	readMore: readMoreLayout,
	linkList: linkListLayout,
	podcast: podcastLayout,
	footer: footerLayout,
	finish: finishLayout,
};
