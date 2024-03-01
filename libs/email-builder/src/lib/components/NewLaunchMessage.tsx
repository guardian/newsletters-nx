import { renderToStaticMarkup } from 'react-dom/server';
import type {
	NewsletterData,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import type { MessageContent } from '../types';
import { MessageFormat } from './MessageFormat';

interface Props {
	pageLink: string;
	newsletter: NewsletterData;
	user?: UserProfile;
}

export const NewLaunchMessage = ({ pageLink, newsletter }: Props) => {
	return (
		<MessageFormat title={<>newsletter launched: {newsletter.name}</>}>
			<p>{pageLink}</p>
		</MessageFormat>
	);
};

export const renderNewLaunchMessage = (props: Props): MessageContent => {
	const { pageLink, newsletter } = props;
	const subject = `New newsletters launched: ${newsletter.name}`;
	const text = `A new newsletter "${newsletter.name}" has been launched: ${pageLink}.`;

	try {
		const html = renderToStaticMarkup(<NewLaunchMessage {...props} />);
		return { html, text, subject };
	} catch (e) {
		console.error(e);
		return { html: text, text, subject };
	}
};
