import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardLayout } from '@newsletters-nx/state-machine';
import { executeCreate } from '../../executeCreate';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { cancelLayout } from './cancelLayout';
import { dateLayout } from './dateLayout';
import { editDraftNewsletterLayout } from './editDraftNewsletterLayout';
import { finishLayout } from './finishLayout';
import { createDraftIntro } from './introLayout';
import { nameAndFrequencyLayout } from './nameAndFrequencyLayout';
import { productionDetailsLayout } from './productionDetailsLayout';
import { promotionContentLayout } from './promotionContentLayout';
import { tagsLayout } from './tagsLayout';
import { targetingLayout } from './targetingLayout';

export const standRedesignLayout: WizardLayout<DraftService> = {
	cancel: cancelLayout,
	intro: createDraftIntro,
	nameAndFrequencyLayout: {
		...nameAndFrequencyLayout,
		executeSkip: executeCreate,
		buttons: {
			...nameAndFrequencyLayout.buttons,
			next: {
				...nameAndFrequencyLayout.buttons['next']!,
				executeStep: executeCreate,
			},
		},
	},
	editDraftNewsletter: {
		...editDraftNewsletterLayout,
		executeSkip,
		buttons: {
			...editDraftNewsletterLayout.buttons,
			next: {
				...editDraftNewsletterLayout.buttons['next']!,
				executeStep: executeModify,
			},
		},
	},
	productionDetails: {
		...productionDetailsLayout,
		executeSkip,
		buttons: {
			...productionDetailsLayout.buttons,
			back: {
				...productionDetailsLayout.buttons['back']!,
				executeStep: executeSkip,
			},
			finish: {
				...productionDetailsLayout.buttons['finish']!,
				executeStep: executeModify,
			},
		},
	},
	dates: {
		...dateLayout,
		executeSkip,
		buttons: {
			...dateLayout.buttons,
			back: {
				...dateLayout.buttons['back']!,
				executeStep: executeSkip,
			},
			finish: {
				...dateLayout.buttons['finish']!,
				executeStep: executeModify,
			},
		},
	},
	targeting: {
		...targetingLayout,
		executeSkip,
		buttons: {
			...targetingLayout.buttons,
			back: {
				...targetingLayout.buttons['back']!,
				executeStep: executeSkip,
			},
			finish: {
				...targetingLayout.buttons['finish']!,
				executeStep: executeModify,
			},
		},
	},
	tags: {
		...tagsLayout,
		executeSkip,
		buttons: {
			...tagsLayout.buttons,
			back: {
				...tagsLayout.buttons['back']!,
				executeStep: executeSkip,
			},
			finish: {
				...tagsLayout.buttons['finish']!,
				executeStep: executeModify,
			},
		},
	},
	signUpPage: {
		...promotionContentLayout,
		executeSkip,
		buttons: {
			...promotionContentLayout.buttons,
			back: {
				...promotionContentLayout.buttons['back']!,
				executeStep: executeSkip,
			},
			next: {
				...promotionContentLayout.buttons['next']!,
				executeStep: executeModify,
			},
		},
	},
	finish: {
		...finishLayout,
		executeSkip,
	},
};
