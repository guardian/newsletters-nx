import { renderToStaticMarkup } from 'react-dom/server';
import type {
	NewsletterData,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import type { MessageContent } from '../types';
import { MessageFormat } from './MessageFormat';
import { NewsletterPropertyTable } from './NewsletterPropertyTable';
import { UserDescription } from './UserDescription';

interface Props {
	pageLink: string;
	newsletter: NewsletterData;
	user?: UserProfile;
}

export const NewLaunchMessage = ({ pageLink, newsletter, user }: Props) => {
	return (
		<MessageFormat title={<>Newsletter launched: {newsletter.name}</>}>
			<p>{pageLink}</p>

			{user && (
				<p>
					launched by:
					<UserDescription user={user} asLink />
				</p>
			)}

			<NewsletterPropertyTable
				newsletter={newsletter}
				properties={['campaignName', 'campaignCode', 'identityName']}
			/>
		</MessageFormat>
	);
};

export const renderNewLaunchMessage = (props: Props): MessageContent => {
	const { pageLink, newsletter } = props;
	const subject = `New newsletter launched: ${newsletter.name}`;
	const text = `A new newsletter "${newsletter.name}" has been launched: ${pageLink}.`;

	try {
		const html = renderToStaticMarkup(<NewLaunchMessage {...props} />);
		return { html, text, subject };
	} catch (e) {
		console.error(e);
		return { html: text, text, subject };
	}
};
