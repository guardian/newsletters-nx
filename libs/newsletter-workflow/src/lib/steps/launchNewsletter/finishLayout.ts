import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';

const markdownToDisplay = `# Finished

You have reached the end of the wizard. The newsletter has been launched.
`.trim();

export const finishLayout: WizardStepLayout = {
	staticMarkdown: markdownToDisplay,
	dynamicMarkdown(requestData, responseData) {
		const [launchDate, thrasherDate] = getStringValuesFromRecord(
			responseData ?? {},
			['launchDate', 'thrasherDate'],
		);

		const lauchDateString = launchDate
			? new Date(launchDate).toDateString()
			: '?';
		const thrasherDateString = thrasherDate
			? new Date(thrasherDate).toDateString()
			: '?';

		return `
		# Finished

You have reached the end of the wizard.
 - The newsletter will be launched on ${lauchDateString}.
 - You have asked for thrashers to be live from ${thrasherDateString}.
		`.trim();
	},
	buttons: {},
};
