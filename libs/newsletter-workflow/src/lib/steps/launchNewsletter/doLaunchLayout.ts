import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeLaunch } from '../../executeLaunch';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
## {{name}} is ready for a launch request

All the data collection steps have now been completed. By requesting a launch for this newsletter, the teams responsible for creating tags, sign-up pages, the Braze campaign and tracking the newsletter will be notified. Once these tasks have been completed, the newsletter will be ready to send.

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
	label: 'Request launch',
	buttons: {
		cancel: {
			buttonType: 'CANCEL',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'LAUNCH',
			label: 'Request Launch',
			stepToMoveTo: 'finish',
			executeStep: executeLaunch,
		},
	},
};
