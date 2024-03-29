import type {
	DraftNewsletterData,
	FormDataRecord,
	LaunchService,
	NewsletterData,
	NewsletterFieldsDerivedFromName,
} from '@newsletters-nx/newsletters-data-client';
import {
	addSuffixToMakeTokenUnique,
	getDraftNotReadyIssues,
	getRenderingOptionsNotReadyIssues,
	withDefaultNewsletterValuesAndDerivedFields,
} from '@newsletters-nx/newsletters-data-client';
import type { CurrentStepRouteRequest } from '@newsletters-nx/state-machine';
import { zodIssueToMarkdown } from './markdown-util';
import { parseToNumber } from './util';

export type LaunchInitialState = FormDataRecord & {
	name?: string;
	hasAllStandardData: boolean;
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
			hasAllStandardData: false,
		};
	}
	const storageResponse = await launchService.draftStorage.read(id);
	const allLaunchedResponse = await launchService.newsletterStorage.list();

	const draft: DraftNewsletterData = storageResponse.ok
		? storageResponse.data
		: {};
	const name = draft.name;
	const draftNotReadyIssues = getDraftNotReadyIssues(draft);
	const renderingOptionsIssues =
		draft.category === 'article-based'
			? getRenderingOptionsNotReadyIssues(draft)
			: [];

	const hasRenderingOptionsIfNeeded = renderingOptionsIssues.length === 0;

	if (draftNotReadyIssues.length > 0) {
		const errorMarkdown = zodIssueToMarkdown(draftNotReadyIssues);
		return {
			name,
			hasAllStandardData: false,
			hasRenderingOptionsIfNeeded,
			errorMarkdown,
			id: request.id,
		};
	}

	const derivedFieldValuesOrActualIfSet =
		withDefaultNewsletterValuesAndDerivedFields(draft);

	const existingNewsletters = allLaunchedResponse.ok
		? allLaunchedResponse.data
		: [];

	suffixDervivedValues(derivedFieldValuesOrActualIfSet, existingNewsletters);

	return {
		name,
		hasAllStandardData: true,
		hasRenderingOptionsIfNeeded,
		errorMarkdown: undefined,
		id: request.id,
		listId: draft.listId,
		identityName: derivedFieldValuesOrActualIfSet.identityName,
		brazeSubscribeEventNamePrefix:
			derivedFieldValuesOrActualIfSet.brazeSubscribeEventNamePrefix,
		brazeNewsletterName: derivedFieldValuesOrActualIfSet.brazeNewsletterName,
		brazeSubscribeAttributeName:
			derivedFieldValuesOrActualIfSet.brazeSubscribeAttributeName,
		brazeSubscribeAttributeNameAlternate:
			derivedFieldValuesOrActualIfSet.brazeSubscribeAttributeNameAlternate,
		campaignName: derivedFieldValuesOrActualIfSet.campaignName,
		campaignCode: derivedFieldValuesOrActualIfSet.campaignCode,
	};
};

const keysToSuffixWithDash = ['identityName'] as const;
const keysToSuffixWithUnderscore = [
	'brazeNewsletterName',
	'brazeSubscribeAttributeName',
	'brazeSubscribeEventNamePrefix',
	'campaignName',
	'campaignCode',
] as const;

function suffixDervivedValues(
	derivedFieldValuesOrActualIfSet: DraftNewsletterData &
		Pick<NewsletterData, NewsletterFieldsDerivedFromName>,
	existingNewsletters: NewsletterData[],
) {
	keysToSuffixWithDash.forEach((key) => {
		const originalToken = derivedFieldValuesOrActualIfSet[key];
		if (originalToken) {
			derivedFieldValuesOrActualIfSet[key] = addSuffixToMakeTokenUnique(
				originalToken,
				existingNewsletters.map((_) => _[key]),
				'-',
			);
		}
	});
	keysToSuffixWithUnderscore.forEach((key) => {
		const originalToken = derivedFieldValuesOrActualIfSet[key];
		if (originalToken) {
			derivedFieldValuesOrActualIfSet[key] = addSuffixToMakeTokenUnique(
				originalToken,
				existingNewsletters.map((_) => _[key]),
				'_',
			);
		}
	});
}
