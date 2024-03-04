import { renderToStaticMarkup } from 'react-dom/server';
import type {
	DraftWithId,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import type { MessageContent } from '../types';
import { MessageFormat } from './MessageFormat';
import { UserDescription } from './UserDescription';

interface Props {
	pageLink: string;
	draft: DraftWithId;
	user?: UserProfile;
}

export const NewDraftMessage = ({ pageLink, draft, user }: Props) => {
	return (
		<MessageFormat title={<>new draft created: {draft.name}</>}>
			<p>{pageLink}</p>
			{user && (
				<p>
					launched by:
					<UserDescription user={user} asLink />
				</p>
			)}
		</MessageFormat>
	);
};

export const renderNewDraftMessage = (props: Props): MessageContent => {
	const { draft, pageLink } = props;
	const subject = `New draft newsletter created: ${draft.name ?? '[UNNAMED]'}`;
	const text = `A new draft, ${
		draft.name ?? '[UNNAMED]'
	}, was created. You can see it on this page: ${pageLink}.`;

	try {
		const html = renderToStaticMarkup(<NewDraftMessage {...props} />);
		return { html, text, subject };
	} catch (e) {
		console.error(e);
		return { html: text, text, subject };
	}
};
