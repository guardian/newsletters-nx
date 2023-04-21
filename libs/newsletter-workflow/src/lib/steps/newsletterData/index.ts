import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { categoryLayout } from './categoryLayout';
import { completeDataCollectionLayout } from './completeDataCollectionLayout';
import { createDraftNewsletterLayout } from './createDraftNewsletterLayout';
import { dateLayout } from './dateLayout';
import { designBriefLayout } from './designBriefLayout';
import { editDraftNewsletterLayout } from './editDraftNewsletterLayout';
import { finishLayout } from './finishLayout';
import { frequencyLayout } from './frequencyLayout';
import { onlineArticleLayout } from './onlineArticleLayout';
import { pillarLayout } from './pillarLayout';
import { regionFocusLayout } from './regionFocusLayout';
import { signUpEmbedLayout } from './signUpEmbedLayout';
import { signUpPageLayout } from './signUpPageLayout';
import { tagsLayout } from './tagsLayout';
import { thrasherLayout } from './thrasherLayout';

export const newsletterDataLayout: WizardLayout<DraftStorage> = {
	createDraftNewsletter: createDraftNewsletterLayout,
	editDraftNewsletter: editDraftNewsletterLayout,
	category: categoryLayout,
	cancel: cancelLayout,
	dates: dateLayout,
	pillar: pillarLayout,
	regionFocus: regionFocusLayout,
	frequency: frequencyLayout,
	onlineArticle: onlineArticleLayout,
	tags: tagsLayout,
	thrasher: thrasherLayout,
	designBrief: designBriefLayout,
	signUpPage: signUpPageLayout,
	signUpEmbed: signUpEmbedLayout,
	completeDataCollection: completeDataCollectionLayout,
	finish: finishLayout,
};
