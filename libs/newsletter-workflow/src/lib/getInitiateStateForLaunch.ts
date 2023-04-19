import type {
	DraftNewsletterData,
	FormDataRecord,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
import type { CurrentStepRouteRequest } from '@newsletters-nx/state-machine';
import { getValidationWarningsAsMarkDownLines } from './markdown-util';
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
	const storageResponse = await launchService.draftStorage.getDraftNewsletter(
		id,
	);

	const draft = storageResponse.ok ? storageResponse.data : undefined;
	const name = draft?.name;
	const report = newsletterDataSchema.safeParse(draft);

	if (!report.success) {
		const errorMarkdown = getValidationWarningsAsMarkDownLines(
			draft as DraftNewsletterData,
			newsletterDataSchema,
		);

		return {
			name,
			isReady: false,
			errorMarkdown,
			id: request.id,
		};
	}

	return { name, isReady: true, errorMarkdown: undefined, id: request.id };
};
