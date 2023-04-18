import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from '../newsletterData/formSchemas';

const markdownTemplate = `
# Rendering Podcast sections in {{name}}

You may want to display some sections in **{{name}}** as Podcast sections.

This will display the section with a dark background, and append a podcast graphic.

![Podcast styling](https://i.guim.co.uk/img/uploads/2023/03/15/podcast.png?quality=85&dpr=2&width=300&s=441a36a662b2adc04b867e3d617d7315)

In order to use this styling for one or more sections, you need to specify the subheading for each section.

The styling will be implemented wherever these subheadings are used.

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const podcastLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Podcast Sections',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'linkList',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'footer',
			executeStep: executeModify,
		},
	},
	schema: formSchemas.podcast,
	canSkipTo: true,
	executeSkip: executeModify,
};
