import type {
	EmailEnvInfo,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import { renderNewDraftMessage } from '../components/NewDraftMessage';
import { getMessageConfig } from '../message-config';
import type { NewDraftMessageParams } from '../types';

export async function buildNewDraftEmail(
	params: NewDraftMessageParams,
	emailEnvInfo: EmailEnvInfo,
	user?: UserProfile,
) {
	const { draft } = params;
	const messageConfig = await getMessageConfig(
		emailEnvInfo,
		'NEW_DRAFT_CREATED',
	);

	const pageLink = `${messageConfig.toolHost}/drafts/${draft.listId}`;

	const content = renderNewDraftMessage({
		pageLink,
		draft,
		user,
	});

	return { content, messageConfig };
}
