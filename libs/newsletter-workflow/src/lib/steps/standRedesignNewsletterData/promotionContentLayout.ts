import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

type PromotionContentLayout = WizardStepLayout<DraftService, typeof formSchemas.promotionContent.shape>

const markdownTemplate = `
# Sign up page for {{name}}.

## Define the sign up page text
`.trim();

const staticSideMarkdown: PromotionContentLayout['staticSideMarkdown'] = [
	{field: 'signUpHeadline', markdown: `
## :icon{symbol="text_snippet"} Sign up page text

Example image with highlighted sections:
- Headline
- Description
- Success Message

![Headline and Description](https://i.guim.co.uk/img/uploads/2023/10/06/signUpImageWithBoarderTwo.png?quality=85&dpr=2&width=300&s=002979e840129ac072654cb66367d971)

`},
	{field: 'signUpEmbedDescription', markdown: `
## :icon{symbol="text_snippet"}  Sign up embed description

This text is used on the in-article embeds and on the newsletters page:

![newsletter sign up](https://uploads.guim.co.uk/2026/06/16/Newsletter-Signup-Desktop.png)
`}, {
	field: 'illustrationCard',
		markdown: `
## :icon{symbol="text_snippet"} Illustration for the newsletters page

To provide an image to use on the all newsletters page, upload the image (in the appropriate aspect ratio 5:3) via the
s3 Uploader service. Once uploaded, copy the vanity url and paste it into the field below. Please note:
- When used on the theguardian.com or other platforms, images are optimised and resized by our image service to be displayed at the most approriate file size for the usage.
- If the orginal image is too large for the image service to process, it will fail and the original version will be used on the page. This can harm the pages performance, especially for users on mobile devices.
- Please make sure that the image you are uploading does not exceed the limits described in this documentation from our image service.
`
	}
]

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const promotionContentLayout: PromotionContentLayout = {
	staticMarkdown,
	label: 'Promotion copy and images',
	staticSideMarkdown: staticSideMarkdown,
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
	buttons: {
		back: {
			buttonType: 'PREVIOUS',
			label: 'Back to previous step',
			stepToMoveTo: getPreviousOrEditStartStepId,
		},
		next: {
			buttonType: 'NEXT',
			label: 'Save and Continue',
			stepToMoveTo: getNextStepId,
		},
	},
	schema: formSchemas.promotionContent,
	fieldDisplayOptions: {
		signUpDescription: {
			textArea: true,
		},
		signUpHeadline: {
			textArea: true,
		},
	},
	canSkip: true,
};
