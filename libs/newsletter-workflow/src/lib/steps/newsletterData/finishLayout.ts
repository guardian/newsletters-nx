import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `# Finished

You have reached the end of the data collection section of the wizard. The draft newsletter **{{name}}** has been created.

Now that the data collection is complete, some automated functionality may be carried out e.g.
- emailing Central Production if a tag relationship is required
- setting things up in Braze (only some of this can be automated - some will still need to be done manually)

Additional pages will be inserted here relating to other steps required to launch a newsletter.
`;

const staticMarkdown = markdownTemplate.replace(regExPatterns.name, '');

const finishLayout: WizardStepLayout = {
	staticMarkdown: staticMarkdown,
	buttons: {},
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
};

export { finishLayout };
