import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { formSchemas } from './formSchemas';

type ProductionDetailsLayout = WizardStepLayout<
	DraftService,
	typeof formSchemas.productionDetails.shape
>;

const staticSideMarkdown: ProductionDetailsLayout['staticSideMarkdown'] = [
	{
		field: 'category',
		markdown: `
## :icon{symbol="text_snippet"} Type of Newsletter
Editorial newsletters can be produced in three ways:
- **article-based**: Each chapter of the newsletter is written as a composer article.
- **fronts-based**: The newsletters are generated from a fronts page.
- **manual-send**: The content of the email are generated manually or with an external tool.
`,
	},
	{
		field: 'onlineArticle',
		markdown: `
## :icon{symbol="text_snippet"} Web Article
Tell the central production if the newsletter will appear as a web article.

This is the case for most newsletters, but you may prefer to offer the newsletter exclusively as an email.

Alternatively, you might want the first send on web to preview it, but subsequent sends to be email-only.
`,
	},
];

const staticMarkdown = `
# Production details
`.trim();

export const productionDetailsLayout: ProductionDetailsLayout = {
	staticMarkdown,
	label: 'Production Details',
	buttons: {
		back: {
			buttonType: 'PREVIOUS',
			label: 'Back to previous step',
			stepToMoveTo: getPreviousOrEditStartStepId,
		},
		finish: {
			buttonType: 'NEXT',
			label: 'Save and continue',
			stepToMoveTo: getNextStepId,
		},
	},
	schema: formSchemas.productionDetails,
	canSkip: true,
	staticSideMarkdown,
};
