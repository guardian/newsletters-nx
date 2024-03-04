import type {
	EmailEnvInfo,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import { renderNewDraftMessage } from '../components/NewDraftMessage';
import { getMessageConfig } from '../message-config';
import type { MessageContent, NewDraftMessageParams } from '../types';

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

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const content = renderNewDraftMessage({
		pageLink,
		draft,
		user,
	}) as MessageContent;

	return { content, messageConfig };
}
