import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { createDraftNewsletterLayout } from './createDraftNewsletterLayout';
import { dateLayout } from './dateLayout';
import { editDraftNewsletterLayout } from './editDraftNewsletterLayout';
import { finishLayout } from './finishLayout';
import { illustrationCardLayout } from './illustrationCardLayout';
import { createDraftIntro } from './introLayout';
import { multiThrashersLayout } from './multiThrashersLayout';
import { pillarAndGroupLayout } from './pillarAndGroupLayout';
import { productionDetailsLayout } from './productionDetailsLayout';
import { regionFocusLayout } from './regionFocusLayout';
import { signUpEmbedLayout } from './signUpEmbedLayout';
import { signUpPageLayout } from './signUpPageLayout';
import { singleThrasherLayout } from './singleThrasherLayout';
import { tagsLayout } from './tagsLayout';

export const newsletterDataLayout: WizardLayout<DraftService> = {
	cancel: cancelLayout,
	intro: createDraftIntro,
	createDraftNewsletter: createDraftNewsletterLayout,
	editDraftNewsletter: editDraftNewsletterLayout,
	productionDetails: productionDetailsLayout,
	dates: dateLayout,
	pillarAndGroup: pillarAndGroupLayout,
	regionFocus: regionFocusLayout,
	tags: tagsLayout,
	thrasher: singleThrasherLayout,
	multiThrashers: multiThrashersLayout,
	illustrationCard: illustrationCardLayout,
	signUpPage: signUpPageLayout,
	signUpEmbed: signUpEmbedLayout,
	finish: finishLayout,
};
