import type { WizardLayout } from '@newsletters-nx/state-machine';
import { footerLayout } from '../renderingOptions/footerLayout';
import { imageLayout } from '../renderingOptions/imageLayout';
import { linkListLayout } from '../renderingOptions/linkListLayout';
import { newsletterHeaderLayout } from '../renderingOptions/newsletterHeaderLayout';
import { podcastLayout } from '../renderingOptions/podcastLayout';
import { readMoreLayout } from '../renderingOptions/readMoreLayout';
import { cancelLayout } from './cancelLayout';
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
};
