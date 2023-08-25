import { renderToStaticMarkup } from 'react-dom/server';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { MessageFormat } from './MessageFormat';

interface Props {
	pageLink: string;
	newsletter: NewsletterData;
}

export const NewLaunchMessage = ({ pageLink, newsletter }: Props) => {
	return (
		<MessageFormat title={<>newsletter launched: {newsletter.name}</>}>
			<p>{pageLink}</p>
		</MessageFormat>
	);
};

export const renderNewLaunchMessage = (props: Props): string => {
	return renderToStaticMarkup(<NewLaunchMessage {...props} />);
};
