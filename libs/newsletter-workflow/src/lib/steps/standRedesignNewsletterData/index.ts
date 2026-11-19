import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardLayout } from '@newsletters-nx/state-machine';
import { cancelLayout } from './cancelLayout';
import { dateLayout } from './dateLayout';
import { finishLayout } from './finishLayout';
import { createDraftIntro } from './introLayout';
import { nameAndFrequencyLayout } from './nameAndFrequencyLayout';
import { productionDetailsLayout } from './productionDetailsLayout';
import { promotionContentLayout } from './promotionContentLayout';
import { reviewLayout } from './reviewLayout';
import { tagsLayout } from './tagsLayout';
import { targetingLayout } from './targetingLayout';

export const standRedesignLayout = {
	cancel: cancelLayout,
	intro: createDraftIntro,
	nameAndFrequency: nameAndFrequencyLayout,
	productionDetails: productionDetailsLayout,
	promotionDates: dateLayout,
	targeting: targetingLayout,
	tags: tagsLayout,
	promotionContent: promotionContentLayout,
	review: reviewLayout,
	finish: finishLayout,
} satisfies WizardLayout<DraftService>;
