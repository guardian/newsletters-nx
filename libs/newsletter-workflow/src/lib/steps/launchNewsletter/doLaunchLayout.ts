import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeLaunch } from '../../executeLaunch';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

// TODO - this page is a placeholder until we implement automation
// I have added it so that both Ophan and Edit Ophan point to a single place from which to call the Launch functionality
const markdownTemplate = `
## {{name}} is ready to launch

All the steps have been completed, so please press the Launch button when you're ready to continue.

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const doLaunchLayout: WizardStepLayout<LaunchService> = {
	staticMarkdown,
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
	label: 'Launch',
	buttons: {
		cancel: {
			buttonType: 'CANCEL',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'NEXT',
			label: 'Launch',
			stepToMoveTo: 'finish',
			executeStep: executeLaunch,
		},
	},
};
