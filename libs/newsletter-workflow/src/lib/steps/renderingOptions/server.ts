import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { cancelLayout } from './cancelLayout';
import { darkSectionLayout } from './darkSectionLayout';
import { finishLayout } from './finishLayout';
import { footerLayout } from './footerLayout';
import { imageLayout } from './imageLayout';
import { linkListLayout } from './linkListLayout';
import { newsletterHeaderLayout } from './newsletterHeaderLayout';
import { paletteOverrideLayout } from './paletteOverrideLayout';
import { podcastLayout } from './podcastLayout';
import { readMoreLayout } from './readMoreLayout';
import { startLayout } from './startLayout';

export const renderingOptionsLayout: WizardLayout<DraftService> = {
	start: {
		...startLayout,
		executeSkip: executeModify,
	},
	newsletterHeader: {
		...newsletterHeaderLayout,
		executeSkip: executeModify,
		buttons: {
			...newsletterHeaderLayout.buttons,
			back: { ...newsletterHeaderLayout.buttons['back']!, executeStep: executeModify },
			finish: { ...newsletterHeaderLayout.buttons['finish']!, executeStep: executeModify },
		},
	},
	image: {
		...imageLayout,
		executeSkip: executeModify,
		buttons: {
			...imageLayout.buttons,
			back: { ...imageLayout.buttons['back']!, executeStep: executeModify },
			finish: { ...imageLayout.buttons['finish']!, executeStep: executeModify },
		},
	},
	paletteOverride: {
		...paletteOverrideLayout,
		executeSkip: executeModify,
		buttons: {
			...paletteOverrideLayout.buttons,
			back: { ...paletteOverrideLayout.buttons['back']!, executeStep: executeModify },
			finish: { ...paletteOverrideLayout.buttons['finish']!, executeStep: executeModify },
		},
	},
	readMore: {
		...readMoreLayout,
		executeSkip: executeModify,
		buttons: {
			...readMoreLayout.buttons,
			back: { ...readMoreLayout.buttons['back']!, executeStep: executeModify },
			next: { ...readMoreLayout.buttons['next']!, executeStep: executeModify },
		},
	},
	linkList: {
		...linkListLayout,
		executeSkip: executeModify,
		buttons: {
			...linkListLayout.buttons,
			back: { ...linkListLayout.buttons['back']!, executeStep: executeModify },
			finish: { ...linkListLayout.buttons['finish']!, executeStep: executeModify },
		},
	},
	podcast: {
		...podcastLayout,
		executeSkip: executeModify,
		buttons: {
			...podcastLayout.buttons,
			back: { ...podcastLayout.buttons['back']!, executeStep: executeModify },
			finish: { ...podcastLayout.buttons['finish']!, executeStep: executeModify },
		},
	},
	darkTheme: {
		...darkSectionLayout,
		executeSkip: executeModify,
		buttons: {
			...darkSectionLayout.buttons,
			back: { ...darkSectionLayout.buttons['back']!, executeStep: executeModify },
			next: { ...darkSectionLayout.buttons['next']!, executeStep: executeModify },
		},
	},
	footer: {
		...footerLayout,
		executeSkip: executeModify,
		buttons: {
			...footerLayout.buttons,
			back: { ...footerLayout.buttons['back']!, executeStep: executeModify },
			finish: { ...footerLayout.buttons['finish']!, executeStep: executeModify },
		},
	},
	finish: {
		...finishLayout,
		executeSkip: executeModify,
		buttons: {
			...finishLayout.buttons,
			back: { ...finishLayout.buttons['back']!, executeStep: executeModify },
		},
	},
	cancel: cancelLayout,
};
