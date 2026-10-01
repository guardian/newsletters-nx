import { baseColors } from '@guardian/stand';
import { Layout as StandLayout } from '@guardian/stand/Layout';
import { Link } from '@guardian/stand/Link';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';
import { RouterProvider as AriaRouterProvider } from 'react-aria-components';
import { useHref, useLoaderData, useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/user-hooks';
import { LAUNCHED_LIMIT, splitHomeRows } from '../../lib/home-rows';
import type { AllNewslettersData } from '../../loaders/all-newsletters';
import { FailedSourcesMessages } from '../home/FailedSourcesMessages';
import { mainStyle, pageStyle, titleStyle } from '../home/home.styles';
import { NewsletterPanel } from '../home/NewsletterPanel';

export const HomeView = () => {
	const { rows, failedSources } =
		useLoaderData<unknown>() as AllNewslettersData;
	const permissions = usePermissions();
	const navigate = useNavigate();

	// Rows arrive sorted most recently updated first.
	const { drafts, launched } = splitHomeRows(rows);

	return (
		<StandLayout.Main cssOverrides={mainStyle}>
			<AriaRouterProvider
				navigate={(path) => void navigate(path)}
				useHref={useHref}
			>
				<Typography element="h1" variant="titleXl" cssOverrides={titleStyle}>
					Welcome to the Newsletters tool
				</Typography>
				<FailedSourcesMessages failedSources={failedSources} />
				<div css={pageStyle}>
					<NewsletterPanel
						title="Draft newsletters"
						background={baseColors.yellow[800]}
						rows={drafts}
						emptyText="No draft newsletters"
						action={
							permissions?.editEverything && (
								<LinkButton
									href="/drafts/newsletter-data"
									variant="tertiary"
									size="sm"
									icon="add"
								>
									Create new
								</LinkButton>
							)
						}
					/>
					<NewsletterPanel
						title="Launched newsletters"
						background={baseColors.green[800]}
						rows={launched}
						caption={`${LAUNCHED_LIMIT} most recently updated`}
						emptyText="No launched newsletters"
						action={<Link href="/all">View all</Link>}
					/>
				</div>
			</AriaRouterProvider>
		</StandLayout.Main>
	);
};
