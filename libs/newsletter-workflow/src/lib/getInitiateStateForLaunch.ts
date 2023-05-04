import type {
	DraftNewsletterData,
	FormDataRecord,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import {
	getDraftNotReadyIssues,
	renderingOptionsSchema,
} from '@newsletters-nx/newsletters-data-client';
import type { CurrentStepRouteRequest } from '@newsletters-nx/state-machine';
import { zodIssueToMarkdown } from './markdown-util';
import { parseToNumber } from './util';

export type LaunchInitialState = FormDataRecord & {
	name?: string;
	isReady: boolean;
	hasRenderingOptionsIfNeeded: boolean;
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
			hasRenderingOptionsIfNeeded: false,
			isReady: false,
		};
	}
	const storageResponse = await launchService.draftStorage.getDraftNewsletter(
		id,
	);

	const draft: DraftNewsletterData = storageResponse.ok
		? storageResponse.data
		: {};
	const name = draft.name;
	const issues = getDraftNotReadyIssues(draft);

	const hasRenderingOptionsIfNeeded =
		draft.category === 'article-based'
			? draft.renderingOptions
				? renderingOptionsSchema.safeParse(draft.renderingOptions).success
				: false
			: true;

	if (issues.length > 0) {
		const errorMarkdown = zodIssueToMarkdown(issues);
		return {
			name,
			isReady: false,
			hasRenderingOptionsIfNeeded,
			errorMarkdown,
			id: request.id,
		};
	}

	return {
		name,
		isReady: true,
		hasRenderingOptionsIfNeeded,
		errorMarkdown: undefined,
		id: request.id,
	};
};
