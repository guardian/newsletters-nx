import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `# Finished

You have reached the end of the wizard. The draft newsletter **{{name}}** has been created.

{{block1}}

`;

const staticMarkdown = markdownTemplate
	.replace(regExPatterns.name, '')
	.replace(regExPatterns.block1, '');

const finishLayout: WizardStepLayout = {
	staticMarkdown: staticMarkdown,
	buttons: {},
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}

		const [name = 'NAME', signUpPageDate, thrasherDate] =
			getStringValuesFromRecord(responseData, [
				'name',
				'signUpPageDate',
				'thrasherDate',
			]);

		const signUpPageDateString = signUpPageDate
			? new Date(signUpPageDate).toDateString()
			: '?';
		const thrasherDateString = thrasherDate
			? new Date(thrasherDate).toDateString()
			: '?';

		const datesBlock = `
		Sign up page date:  ${signUpPageDateString}

		thrasher date: ${thrasherDateString}
		`;

		return markdownTemplate
			.replace(regExPatterns.name, name)
			.replace(regExPatterns.block1, datesBlock);
	},
};

export { finishLayout };
