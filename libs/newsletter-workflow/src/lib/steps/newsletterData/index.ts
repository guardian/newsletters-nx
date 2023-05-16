import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { categoryLayout } from './categoryLayout';
import { createDraftNewsletterLayout } from './createDraftNewsletterLayout';
import { dateLayout } from './dateLayout';
import { editDraftNewsletterLayout } from './editDraftNewsletterLayout';
import { finishLayout } from './finishLayout';
import { frequencyLayout } from './frequencyLayout';
import { multiThrashersLayout } from './multiThrashersLayout';
import { newsletterDesignLayout } from './newsletterDesignLayout';
import { onlineArticleLayout } from './onlineArticleLayout';
import { pillarAndGroupLayout } from './pillarAndGroupLayout';
import { regionFocusLayout } from './regionFocusLayout';
import { signUpEmbedLayout } from './signUpEmbedLayout';
import { signUpPageLayout } from './signUpPageLayout';
import { tagsLayout } from './tagsLayout';
import { thrasherLayout } from './thrasherLayout';

export const newsletterDataLayout: WizardLayout<DraftStorage> = {
	cancel: cancelLayout,
	createDraftNewsletter: createDraftNewsletterLayout,
	editDraftNewsletter: editDraftNewsletterLayout,
	category: categoryLayout,
	dates: dateLayout,
	pillarAndGroup: pillarAndGroupLayout,
	regionFocus: regionFocusLayout,
	frequency: frequencyLayout,
	onlineArticle: onlineArticleLayout,
	tags: tagsLayout,
	thrasher: thrasherLayout,
	multiThrashers: multiThrashersLayout,
	newsletterDesign: newsletterDesignLayout,
	signUpPage: signUpPageLayout,
	signUpEmbed: signUpEmbedLayout,
	finish: finishLayout,
};
