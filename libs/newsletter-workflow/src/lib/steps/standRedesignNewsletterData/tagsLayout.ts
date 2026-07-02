import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

type TagsLayout = WizardStepLayout<DraftService, typeof formSchemas.tags.shape>;

const markdownTemplate = `
# Propose the tags for the newsletter

Share ideas for tags with central production
`.trim();

const staticSideMarkdown: TagsLayout['staticSideMarkdown'] = [
	{
		field: 'seriesTag',
		markdown: `
## :icon{symbol="text_snippet"} Tag suggestions
This section allows you to suggest the tags you think will work best to promote the newsletter.

Central Production will review the tags and confirm the final recommendation. They will set up any new tags in tag manager.

The request to set up these tags will not be sent till you select “finish”.
`,
	},
	{
		markdown: `
## :icon{symbol="text_snippet"} Series Tag
Please share the series tag URL & description for the newsletter.
For example :link[tv-and-radio/series/what-s-on-tv]{href="https://www.theguardian.com/tv-and-radio/series/what-s-on-tv" target="_blank"} for the What's On newsletter.
`,
	},
	{
		field: 'composerTag',
		markdown: `
## :icon{symbol="text_snippet"} Composer tag relationship for newsletter embeds
In Composer, we now have a feature where a newsletter signup embed is proposed to the user once a tag is added to the article

For example, the Games (video games only) tag recommends the user adds the Pushing Buttons (newsletter signup) campaign tag, which displays the sign up embed for Pushing Buttons.
`,
	},
];

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const tagsLayout: TagsLayout = {
	staticMarkdown,
	label: 'Tag Setting',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
	staticSideMarkdown,
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
			onBeforeStepChangeValidate: (stepData) => {
				if (!stepData.formData) {
					return undefined;
				}
				const seriesTag = stepData.formData['seriesTag'] ?? undefined;
				const seriesTagDescription =
					stepData.formData['seriesTagDescription'] ?? undefined;
				if (seriesTag && !seriesTagDescription) {
					return {
						message:
							'Series tag description is required if series tag specified',
					};
				}
				const composerTag = stepData.formData['composerTag'] ?? undefined;
				const composerCampaignTag =
					stepData.formData['composerCampaignTag'] ?? undefined;
				if (composerTag || composerCampaignTag) {
					if (!composerTag) {
						return {
							message:
								'Enter at least one composer tag if specifying composer campaign tag',
						};
					}
					if (!composerCampaignTag) {
						return {
							message: 'Enter composer campaign tag if specifying composer tag',
						};
					}
				}
				return undefined;
			},
		},
	},
	schema: formSchemas.tags,
	canSkip: true,
};
