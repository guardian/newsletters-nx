import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type {
	AsyncExecution,
	WizardLayout,
	WizardStepData,
} from '@newsletters-nx/state-machine';
import { executeCreate } from '../../executeCreate';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
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

const hasListId = (stepData: WizardStepData): boolean =>
	typeof stepData.formData?.listId === 'number' || !!stepData.id;

/**
 * The draft is not created until the editor first saves field data on
 * a step, so the first save creates it and subsequent saves modify it.
 */
const saveDraft: AsyncExecution<DraftService> = async (
	stepData,
	stepLayout,
	service,
) => {
	if (hasListId(stepData)) {
		return executeModify(stepData, stepLayout, service);
	}

	return executeCreate(stepData, stepLayout, service);
};

/**
 * Moving between steps before the draft has been created must not create
 * one, and there is nothing in storage to load, so start with blank data.
 */
const loadDraftIfSaved: AsyncExecution<DraftService> = async (
	stepData,
	stepLayout,
	service,
) => {
	if (hasListId(stepData)) {
		return executeSkip(stepData, stepLayout, service);
	}

	return { data: {} };
};

export const standRedesignLayout: WizardLayout<DraftService> = {
	cancel: cancelLayout,
	intro: {
		...createDraftIntro,
		executeSkip: loadDraftIfSaved,
		buttons: {
			...createDraftIntro.buttons,
			next: {
				...createDraftIntro.buttons['next']!,
				executeStep: loadDraftIfSaved,
			},
		},
	},
	nameAndFrequencyLayout: {
		...nameAndFrequencyLayout,
		executeSkip: loadDraftIfSaved,
		buttons: {
			...nameAndFrequencyLayout.buttons,
			next: {
				...nameAndFrequencyLayout.buttons['next']!,
				executeStep: saveDraft,
			},
		},
	},
	productionDetails: {
		...productionDetailsLayout,
		executeSkip: loadDraftIfSaved,
		buttons: {
			...productionDetailsLayout.buttons,
			back: {
				...productionDetailsLayout.buttons['back']!,
				executeStep: loadDraftIfSaved,
			},
			finish: {
				...productionDetailsLayout.buttons['finish']!,
				executeStep: saveDraft,
			},
		},
	},
	dates: {
		...dateLayout,
		executeSkip: loadDraftIfSaved,
		buttons: {
			...dateLayout.buttons,
			back: {
				...dateLayout.buttons['back']!,
				executeStep: loadDraftIfSaved,
			},
			finish: {
				...dateLayout.buttons['finish']!,
				executeStep: saveDraft,
			},
		},
	},
	targeting: {
		...targetingLayout,
		executeSkip: loadDraftIfSaved,
		buttons: {
			...targetingLayout.buttons,
			back: {
				...targetingLayout.buttons['back']!,
				executeStep: loadDraftIfSaved,
			},
			finish: {
				...targetingLayout.buttons['finish']!,
				executeStep: saveDraft,
			},
		},
	},
	tags: {
		...tagsLayout,
		executeSkip: loadDraftIfSaved,
		buttons: {
			...tagsLayout.buttons,
			back: {
				...tagsLayout.buttons['back']!,
				executeStep: loadDraftIfSaved,
			},
			finish: {
				...tagsLayout.buttons['finish']!,
				executeStep: saveDraft,
			},
		},
	},
	signUpPage: {
		...promotionContentLayout,
		executeSkip: loadDraftIfSaved,
		buttons: {
			...promotionContentLayout.buttons,
			back: {
				...promotionContentLayout.buttons['back']!,
				executeStep: loadDraftIfSaved,
			},
			next: {
				...promotionContentLayout.buttons['next']!,
				executeStep: saveDraft,
			},
		},
	},
	review: {
		...reviewLayout,
		executeSkip,
		buttons: {
			...reviewLayout.buttons,
			back: {
				...reviewLayout.buttons['back']!,
				executeStep: executeSkip,
			},
			next: {
				...reviewLayout.buttons['next']!,
				executeStep: executeModify,
			},
		},
	},
	finish: {
		...finishLayout,
		executeSkip,
	},
};
