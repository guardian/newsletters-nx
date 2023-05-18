import type {
	DraftNewsletterData,
	FormDataRecord,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import {
	addSuffixToMakeTokenUnique,
	getDraftNotReadyIssues,
	renderingOptionsSchema,
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
	const allLauchedResponse = await launchService.newsletterStorage.list();

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
			hasAllStandardData: false,
			hasRenderingOptionsIfNeeded,
			errorMarkdown,
			id: request.id,
		};
	}

	const derivedFieldValuesOrActualIfSet =
		withDefaultNewsletterValuesAndDerivedFields(draft);

	const existingNewsletters = allLauchedResponse.ok
		? allLauchedResponse.data
		: [];

	derivedFieldValuesOrActualIfSet.identityName = addSuffixToMakeTokenUnique(
		derivedFieldValuesOrActualIfSet.identityName,
		existingNewsletters.map((_) => _.identityName),
	);

	derivedFieldValuesOrActualIfSet.brazeNewsletterName =
		addSuffixToMakeTokenUnique(
			derivedFieldValuesOrActualIfSet.brazeNewsletterName,
			existingNewsletters.map((_) => _.brazeNewsletterName),
			'_',
		);
	derivedFieldValuesOrActualIfSet.brazeSubscribeAttributeName =
		addSuffixToMakeTokenUnique(
			derivedFieldValuesOrActualIfSet.brazeSubscribeAttributeName,
			existingNewsletters.map((_) => _.brazeSubscribeAttributeName),
			'_',
		);
	derivedFieldValuesOrActualIfSet.brazeSubscribeEventNamePrefix =
		addSuffixToMakeTokenUnique(
			derivedFieldValuesOrActualIfSet.brazeSubscribeEventNamePrefix,
			existingNewsletters.map((_) => _.brazeSubscribeEventNamePrefix),
			'_',
		);
	derivedFieldValuesOrActualIfSet.campaignName = addSuffixToMakeTokenUnique(
		derivedFieldValuesOrActualIfSet.campaignName as string,
		existingNewsletters.map((_) => _.campaignName),
		'_',
	);
	derivedFieldValuesOrActualIfSet.campaignCode = addSuffixToMakeTokenUnique(
		derivedFieldValuesOrActualIfSet.campaignCode as string,
		existingNewsletters.map((_) => _.campaignCode),
		'_',
	);

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
