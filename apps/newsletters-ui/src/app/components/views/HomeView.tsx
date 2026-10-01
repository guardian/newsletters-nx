import { css } from '@emotion/react';
import {
	baseColors,
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Badge } from '@guardian/stand/Badge';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Layout as StandLayout } from '@guardian/stand/Layout';
import { Link } from '@guardian/stand/Link';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';
import { from, until } from '@guardian/stand/utils';
import { RouterProvider as AriaRouterProvider } from 'react-aria-components';
import { useHref, useLoaderData, useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/user-hooks';
import type { NewsletterRow } from '../../lib/all-newsletters-rows';
import { formatPillarCategoryLabel } from '../../lib/all-newsletters-rows';
import { formatLastUpdated } from '../../lib/format-last-updated';
import type { AllNewslettersData } from '../../loaders/all-newsletters';
import { NewsletterThumbnail } from '../NewsletterThumbnail';

const mainStyle = css`
	min-height: 0;
	box-sizing: border-box;
	padding-inline: ${semanticSpacing.stackMd};

	${from.lg} {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
`;

const LAUNCHED_LIMIT = 15;

const welcomeStyle = css`
	max-width: 1400px;
	margin: 0 auto ${semanticSpacing.stackLg};
	width: 100%;
	box-sizing: border-box;
`;

const pageStyle = css`
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: ${semanticSpacing.stackXl};
	align-items: start;
	max-width: 1400px;
	margin-inline: auto;
	width: 100%;
	box-sizing: border-box;

	${from.lg} {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: minmax(0, 1fr);
		align-items: stretch;
		flex: 1;
		min-height: 0;
	}
`;

const sectionStyle = css`
	${from.lg} {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
`;

const panelStyle = css`
	${from.lg} {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	border: ${semanticSizing.border.default} solid ${semanticColors.border.weak};
	border-radius: ${semanticRadius.cornerSm};
	overflow: hidden;
	background-color: ${semanticColors.bg.base};
`;

const titleGroupStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackXxs};
`;

const titleBarStyle = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${semanticSpacing.stackMd};
	min-height: 2.5rem;
	margin-bottom: ${semanticSpacing.stackSm};
`;

const columnHeaderStyle = (background: string) => css`
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	align-items: center;
	gap: ${semanticSpacing.stackLg};
	padding: ${semanticSpacing.stackSm} ${semanticSpacing.stackMd};
	background-color: ${background};
	box-sizing: border-box;

	${from.lg} {
		position: sticky;
		top: 0;
		z-index: 1;
	}

	${from.md} {
		grid-template-columns: minmax(0, 1fr) 8.5rem 9.5rem;
	}
`;

const lastUpdatedHeaderStyle = css`
	${until.md} {
		display: none;
	}
`;

const statusHeaderStyle = css`
	min-width: 5rem;
	white-space: nowrap;
`;

const listStyle = css`
	list-style: none;
	margin: 0;
	padding: 0;
`;

// The header lives inside the scroll area so it shares the rows' width
// (the scrollbar would otherwise offset the two).
const scrollAreaStyle = css`
	${from.lg} {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
`;

const rowStyle = css`
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	align-items: center;
	gap: ${semanticSpacing.stackLg};
	padding: ${semanticSpacing.stackSm} ${semanticSpacing.stackMd};
	border-top: ${semanticSizing.border.default} solid
		${semanticColors.border.weak};

	${from.md} {
		grid-template-columns: minmax(0, 1fr) 8.5rem 9.5rem;
	}
`;

const newsletterCellStyle = css`
	display: flex;
	align-items: center;
	gap: ${semanticSpacing.stackSm};
	min-width: 0;
`;

const detailsStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackXxs};
	min-width: 0;
`;

const titleLinkStyle = css`
	display: block;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const titleStyle = css`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const subTextStyle = css`
	color: ${semanticColors.text.weak};
`;

const lastUpdatedStyle = css`
	${until.md} {
		display: none;
	}
`;

const badgeCellStyle = css`
	white-space: nowrap;
	display: flex;
	justify-content: flex-start;
`;

const emptyStyle = css`
	padding: ${semanticSpacing.stackLg} ${semanticSpacing.stackMd};
	color: ${semanticColors.text.weak};
	border-top: ${semanticSizing.border.default} solid
		${semanticColors.border.weak};
`;

const errorsStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackXs};
	max-width: 1400px;
	margin: 0 auto ${semanticSpacing.stackMd};
`;

const NewsletterRowItem = ({ row }: { row: NewsletterRow }) => {
	const pillarCategoryLabel = formatPillarCategoryLabel(
		row.theme,
		row.category,
	);
	const lastUpdated = formatLastUpdated(row.lastUpdated);

	return (
		<li css={rowStyle}>
			<div css={newsletterCellStyle}>
				<NewsletterThumbnail src={row.thumbnailUrl} />
				<div css={detailsStyle}>
					<Link href={row.href} cssOverrides={titleLinkStyle}>
						<Typography
							element="span"
							variant="bodyBoldMd"
							cssOverrides={titleStyle}
						>
							{row.name}
						</Typography>
					</Link>
					{pillarCategoryLabel && (
						<Typography
							element="span"
							variant="bodySm"
							cssOverrides={subTextStyle}
						>
							{pillarCategoryLabel}
						</Typography>
					)}
				</div>
			</div>
			<Typography
				element="span"
				variant="bodyMd"
				cssOverrides={lastUpdatedStyle}
			>
				{lastUpdated}
			</Typography>
			<div css={badgeCellStyle}>
				<Badge color={row.statusBadge.color} weight="strong">
					{row.statusBadge.label}
				</Badge>
			</div>
		</li>
	);
};

const NewsletterPanel = ({
	title,
	background,
	rows,
	emptyText,
	action,
	caption,
}: {
	title: string;
	background: string;
	rows: NewsletterRow[];
	emptyText: string;
	action?: React.ReactNode;
	caption?: string;
}) => (
	<section aria-label={title} css={sectionStyle}>
		<div css={titleBarStyle}>
			<div css={titleGroupStyle}>
				<Typography element="h2" variant="headingLg">
					{title}
				</Typography>
				{caption && (
					<Typography
						element="span"
						variant="bodySm"
						cssOverrides={subTextStyle}
					>
						{caption}
					</Typography>
				)}
			</div>
			{action}
		</div>
		<div css={panelStyle}>
			<div css={scrollAreaStyle}>
				<div css={columnHeaderStyle(background)}>
					<Typography element="span" variant="bodyBoldMd">
						Newsletters
					</Typography>
					<Typography
						element="span"
						variant="bodyBoldMd"
						cssOverrides={lastUpdatedHeaderStyle}
					>
						Last updated
					</Typography>
					<Typography
						element="span"
						variant="bodyBoldMd"
						cssOverrides={statusHeaderStyle}
					>
						Status
					</Typography>
				</div>
				{rows.length === 0 ? (
					<Typography element="p" variant="bodyMd" cssOverrides={emptyStyle}>
						{emptyText}
					</Typography>
				) : (
					<ul css={listStyle}>
						{rows.map((row) => (
							<NewsletterRowItem key={row.id} row={row} />
						))}
					</ul>
				)}
			</div>
		</div>
	</section>
);

const sourceLabels: Record<string, string> = {
	launched: 'launched newsletters',
	draft: 'draft newsletters',
};

export const HomeView = () => {
	const { rows, failedSources } =
		useLoaderData<unknown>() as AllNewslettersData;
	const permissions = usePermissions();
	const navigate = useNavigate();

	const drafts = rows.filter((row) => row.kind === 'draft');
	// Rows arrive sorted most recently updated first.
	const launched = rows
		.filter((row) => row.kind === 'launched')
		.slice(0, LAUNCHED_LIMIT);

	return (
		<StandLayout.Main cssOverrides={mainStyle}>
			<AriaRouterProvider
				navigate={(path) => void navigate(path)}
				useHref={useHref}
			>
				<div css={welcomeStyle}>
					<Typography element="h1" variant="titleXl">
						Welcome to Newsletters
					</Typography>
				</div>
				{failedSources.length > 0 && (
					<div css={errorsStyle}>
						{failedSources.map((source) => (
							<InlineMessage key={source} level="error">
								{`Could not load ${sourceLabels[source] ?? source}.`}
							</InlineMessage>
						))}
					</div>
				)}
				<div css={pageStyle}>
					<NewsletterPanel
						title="Draft newsletters"
						background={baseColors.yellow[800]}
						rows={drafts}
						emptyText="No draft newsletters"
						action={
							permissions?.editEverything ? (
								<LinkButton
									href="/drafts/newsletter-data"
									variant="tertiary"
									size="sm"
									icon="add"
								>
									Create new
								</LinkButton>
							) : undefined
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
