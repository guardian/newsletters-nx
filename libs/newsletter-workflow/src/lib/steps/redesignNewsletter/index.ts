import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { dateLayout } from './dateLayout';
import { editDraftNewsletterLayout } from './editDraftNewsletterLayout';
import { finishLayout } from './finishLayout';
import { nameAndFrequencyLayout } from './nameAndFrequencyLayout';
import { productionDetailsLayout } from './productionDetailsLayout';
import { promotionContentLayout } from './promotionContentLayout';
import { tagsLayout } from './tagsLayout';
import { targetingLayout } from './targetingLayout';

export const redesignLayout: WizardLayout<DraftService> = {
	cancel: cancelLayout,
	nameAndFrequencyLayout: nameAndFrequencyLayout,
	editDraftNewsletter: editDraftNewsletterLayout,
	productionDetails: productionDetailsLayout,
	dates: dateLayout,
	targeting: targetingLayout,
	tags: tagsLayout,
	signUpPage: promotionContentLayout,
	finish: finishLayout,
};
