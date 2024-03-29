import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { darkSectionLayout } from './darkSectionLayout';
import { finishLayout } from './finishLayout';
import { footerLayout } from './footerLayout';
import { imageLayout } from './imageLayout';
import { linkListLayout } from './linkListLayout';
import { newsletterHeaderLayout } from './newsletterHeaderLayout';
import { paletteOverrideLayout } from './paletteOverrideLayout';
import { podcastLayout } from './podcastLayout';
import { readMoreLayout } from './readMoreLayout';
import { startLayout } from './startLayout';

export const renderingOptionsLayout: WizardLayout<DraftService> = {
	start: startLayout,
	newsletterHeader: newsletterHeaderLayout,
	image: imageLayout,
	paletteOverride: paletteOverrideLayout,
	readMore: readMoreLayout,
	linkList: linkListLayout,
	podcast: podcastLayout,
	darkTheme: darkSectionLayout,
	footer: footerLayout,
	finish: finishLayout,
	cancel: cancelLayout,
};
