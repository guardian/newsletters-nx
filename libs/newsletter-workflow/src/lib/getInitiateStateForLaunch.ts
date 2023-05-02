import type {
	DraftNewsletterData,
	FormDataRecord,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import { getDraftNotReadyIssues } from '@newsletters-nx/newsletters-data-client';
import type { CurrentStepRouteRequest } from '@newsletters-nx/state-machine';
import { zodIssueToMarkdown } from './markdown-util';
import { parseToNumber } from './util';

type LaunchInitialState = FormDataRecord & {
	name?: string;
	isReady: boolean;
	errorMarkdown?: string[];
	id?: string;
};

export const getInitialStateForLaunch = async (
	request: CurrentStepRouteRequest,
	launchService: LaunchService,
): Promise<LaunchInitialState> => {
	const id = parseToNumber(request.id);
	if (id === undefined) {
		return {
			isReady: false,
		};
	}
	const storageResponse = await launchService.draftStorage.read(id);

	const draft: DraftNewsletterData = storageResponse.ok
		? storageResponse.data
		: {};
	const name = draft.name;
	const issues = getDraftNotReadyIssues(draft);

	if (issues.length > 0) {
		const errorMarkdown = zodIssueToMarkdown(issues);
		return {
			name,
			isReady: false,
			errorMarkdown,
			id: request.id,
		};
	}

	return { name, isReady: true, errorMarkdown: undefined, id: request.id };
};
