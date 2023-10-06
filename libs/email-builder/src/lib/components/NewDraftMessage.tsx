import { renderToStaticMarkup } from 'react-dom/server';
import type { DraftWithId } from '@newsletters-nx/newsletters-data-client';
import type { MessageContent } from '../types';
import { MessageFormat } from './MessageFormat';

interface Props {
	pageLink: string;
	draft: DraftWithId;
}

export const NewDraftMessage = ({ pageLink, draft }: Props) => {
	return (
		<MessageFormat title={<>new draft created: {draft.name}</>}>
			<p>{pageLink}</p>
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
