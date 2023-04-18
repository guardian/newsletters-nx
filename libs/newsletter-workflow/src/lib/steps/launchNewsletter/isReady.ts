import type { Launcheroo } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# # Is {{name}} ready to launch?

The answer is: {{answer}}

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const isReadyLayout: WizardStepLayout<Launcheroo> = {
	staticMarkdown,
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME', isReady = 'IDK'] = getStringValuesFromRecord(
			responseData,
			['name', 'isReady'],
		);

		return markdownTemplate
			.replace(regExPatterns.name, name)
			.replace(regExPatterns.answer, isReady);
	},
	label: 'check if ready',
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Finish',
			stepToMoveTo: 'finish',
		},
	},
};
