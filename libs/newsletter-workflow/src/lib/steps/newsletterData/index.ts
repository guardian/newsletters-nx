import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { categoryLayout } from './categoryLayout';
import { createDraftNewsletterLayout } from './createDraftNewsletterLayout';
import { dateLayout } from './dateLayout';
import { editDraftNewsletterLayout } from './editDraftNewsletterLayout';
import { finishLayout } from './finishLayout';
import { frequencyLayout } from './frequencyLayout';
import { illustrationCardLayout } from './illustrationCardLayout';
import { createDraftIntro } from './introLayout';
import { multiThrashersLayout } from './multiThrashersLayout';
import { onlineArticleLayout } from './onlineArticleLayout';
import { pillarAndGroupLayout } from './pillarAndGroupLayout';
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
	category: categoryLayout,
	dates: dateLayout,
	pillarAndGroup: pillarAndGroupLayout,
	regionFocus: regionFocusLayout,
	frequency: frequencyLayout,
	onlineArticle: onlineArticleLayout,
	tags: tagsLayout,
	thrasher: singleThrasherLayout,
	multiThrashers: multiThrashersLayout,
	illustrationCard: illustrationCardLayout,
	signUpPage: signUpPageLayout,
	signUpEmbed: signUpEmbedLayout,
	finish: finishLayout,
};
