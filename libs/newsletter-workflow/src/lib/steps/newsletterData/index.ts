import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { createDraftNewsletterLayout } from './createDraftNewsletterLayout';
import { dateLayout } from './dateLayout';
import { editDraftNewsletterLayout } from './editDraftNewsletterLayout';
import { finishLayout } from './finishLayout';
import { createDraftIntro } from './introLayout';
import { productionDetailsLayout } from './productionDetailsLayout';
import { promotionContentLayout } from './promotionContentLayout';
import { tagsLayout } from './tagsLayout';
import { targetingLayout } from './targetingLayout';
import { thrashersLayout } from './thrashersLayout';

export const newsletterDataLayout: WizardLayout<DraftService> = {
	cancel: cancelLayout,
	intro: createDraftIntro,
	createDraftNewsletter: createDraftNewsletterLayout,
	editDraftNewsletter: editDraftNewsletterLayout,
	productionDetails: productionDetailsLayout,
	dates: dateLayout,
	targeting: targetingLayout,
	tags: tagsLayout,
	thrasher: thrashersLayout,
	signUpPage: promotionContentLayout,
	finish: finishLayout,
};
