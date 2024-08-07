import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
## Promotion copy and image for {{name}}.

### Sign up page text
Please enter the headline, description and sign-up success message for the sign up page:

![Headline and Description](https://i.guim.co.uk/img/uploads/2023/10/06/signUpImageWithBoarderTwo.png?quality=85&dpr=2&width=300&s=002979e840129ac072654cb66367d971)

### Specify the sign up embed description and Sign up success message

Please enter the description for the sign up embeds - this text is used on the in-article embeds and on the [newsletters page](https://www.theguardian.com/email-newsletters):

![Sign Up Embed Description](https://i.guim.co.uk/img/uploads/2023/04/20/signUp-embed.png?quality=85&dpr=2&width=300&s=48b7b65b3dcbff5fcd4b78c562a4175e)

### Illustration for the newsletters page

To provide an image to use on the all newsletters page, upload the image (in the appropriate aspect ratio 5:3) via the [s3 Uploader service](https://s3-uploader.gutools.co.uk/).
Once uploaded, copy the **vanity url** and paste it into the field below. Please note:

 - When used on the theguardian.com or other platforms, images are optimised and resized by our image service to be displayed at the most approriate file size for the usage.

 - If the orginal image is too large for the image service to process, it will fail and the original version will be used on the page. This can harm the pages performance, especially for users on mobile devices.

**Please make sure** that the image you are uploading does not exceed the limits described in [this documentation from our image service](https://www.fastly.com/documentation/reference/io/#limitations-and-constraints).

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const promotionContentLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Promotion copy and images',
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
			executeStep: executeSkip,
		},
		next: {
			buttonType: 'NEXT',
			label: 'Save and Continue',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
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
	canSkipTo: true,
	executeSkip: executeSkip,
};
