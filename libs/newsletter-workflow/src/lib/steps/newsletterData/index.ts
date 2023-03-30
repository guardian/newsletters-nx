import type { WizardLayout } from '@newsletters-nx/state-machine';
import { brazeLayout } from './brazeLayout';
import { cancelLayout } from './cancelLayout';
import { completeDataCollectionLayout } from './completeDataCollectionLayout';
import { createDraftNewsletterLayout } from './createDraftNewsletterLayout';
import { dateLayout } from './dateLayout';
import { designBriefLayout } from './designBriefLayout';
import { editBrazeLayout } from './editBrazeLayout';
import { editDraftNewsletterLayout } from './editDraftNewsletterLayout';
import { editIdentityNameLayout } from './editIdentityNameLayout';
import { editOphanLayout } from './editOphanLayout';
import { emailCentralProductionLayout } from './emailCentralProductionLayout';
import { finishLayout } from './finishLayout';
import { footerLayout } from './footerLayout';
import { frequencyLayout } from './frequencyLayout';
import { identityNameLayout } from './identityNameLayout';
import { imageLayout } from './imageLayout';
import { linkListLayout } from './linkListLayout';
import { newsletterHeaderLayout } from './newsletterHeaderLayout';
import { onlineArticleLayout } from './onlineArticleLayout';
import { ophanLayout } from './ophanLayout';
import { pillarLayout } from './pillarLayout';
import { podcastLayout } from './podcastLayout';
import { readMoreLayout } from './readMoreLayout';
import { regionFocusLayout } from './regionFocusLayout';
import { signUpLayout } from './signUpLayout';
import { tagsLayout } from './tagsLayout';
import { thrasherLayout } from './thrasherLayout';

export const newsletterDataLayout: WizardLayout = {
	createDraftNewsletter: createDraftNewsletterLayout,
	editDraftNewsletter: editDraftNewsletterLayout,
	cancel: cancelLayout,
	dates: dateLayout,
	pillar: pillarLayout,
	regionFocus: regionFocusLayout,
	frequency: frequencyLayout,
	onlineArticle: onlineArticleLayout,
	tags: tagsLayout,
	thrasher: thrasherLayout,
	designBrief: designBriefLayout,
	signUp: signUpLayout,
	newsletterHeader: newsletterHeaderLayout,
	image: imageLayout,
	readMore: readMoreLayout,
	linkList: linkListLayout,
	podcast: podcastLayout,
	footer: footerLayout,
	identityName: identityNameLayout,
	editIdentityName: editIdentityNameLayout,
	braze: brazeLayout,
	editBraze: editBrazeLayout,
	ophan: ophanLayout,
	editOphan: editOphanLayout,
	completeDataCollection: completeDataCollectionLayout,
	emailCentralProduction: emailCentralProductionLayout,
	finish: finishLayout,
};
