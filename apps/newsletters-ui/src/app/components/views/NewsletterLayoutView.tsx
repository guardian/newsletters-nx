import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Layout } from '@guardian/stand/Layout';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';
import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { RouterProvider as AriaRouterProvider } from 'react-aria-components';
import {
	Navigate,
	useHref,
	useLoaderData,
	useNavigate,
} from 'react-router-dom';
import { usePermissions } from '../../hooks/user-hooks';
import {
	hasNewsletterLayout,
	newsletterLayoutPath,
} from '../../lib/newsletter-layout';
import { NewsletterDetailHeader } from '../NewsletterDetailHeader';
import { NewsletterDetailTabs } from '../NewsletterDetailTabs';
import { NewsletterLayoutPreview } from '../NewsletterLayoutPreview';
import { spacerStyles } from './NewsletterDetailPageView';

const mainStyles = css`
	box-sizing: border-box;
	width: 100%;
	min-width: 0;
	max-width: 1056px;
	margin-inline: auto;
	padding: ${baseSpacing['24Px']};
	@media (max-width: 393px) {
		padding-inline: ${semanticSpacing.stackSm};
	}
`;
const cardStyles = css`
	min-width: 0;
	background: ${semanticColors.bg.base};
	border: 1px solid ${semanticColors.border.weak};
	border-radius: ${semanticRadius.cornerSm};
	padding: ${semanticSpacing.stackMd};
`;
const headingStyles = css`
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: ${semanticSpacing.stackXs};
	h1,
	p {
		margin: 0;
	}
	p {
		margin-top: ${semanticSpacing.stackXs};
		color: ${semanticColors.text.weak};
	}
	@media (max-width: 480px) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

export const NewsletterLayoutView = () => {
	const newsletter = useLoaderData<unknown>();
	const permissions = usePermissions();
	const navigate = useNavigate();
	if (!isNewsletterData(newsletter)) {
		return (
			<Layout.Main css={mainStyles}>
				<p>Newsletter not found.</p>
			</Layout.Main>
		);
	}
	const id = newsletter.identityName;
	if (!hasNewsletterLayout(newsletter.category)) {
		return <Navigate to={newsletterLayoutPath(id, 'details')} replace />;
	}
	return (
		<Layout.Main css={[mainStyles, spacerStyles]}>
			<NewsletterDetailHeader newsletter={newsletter}>
				<NewsletterDetailTabs identityName={id} selected="layout" />
			</NewsletterDetailHeader>
			<div css={[cardStyles, spacerStyles]}>
				<header css={headingStyles}>
					<div>
						<Typography element="h1" variant="heading2Xl">
							Newsletter layout preview
						</Typography>
						<Typography element="p" variant="bodyMd">
							How your template will look (see Composer for full preview)
						</Typography>
					</div>
					{permissions?.editEverything && (
						<AriaRouterProvider
							navigate={(path) => void navigate(path)}
							useHref={useHref}
						>
							<LinkButton
								href={`/launched/rendering-options/${encodeURIComponent(id)}`}
								variant="tertiary"
								size="md"
								icon="edit"
							>
								Edit layout
							</LinkButton>
						</AriaRouterProvider>
					)}
				</header>
				<NewsletterLayoutPreview
					key={newsletter.listId}
					newsletter={newsletter}
				/>
			</div>
		</Layout.Main>
	);
};
