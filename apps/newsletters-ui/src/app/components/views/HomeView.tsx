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
import { componentLayout, Layout as StandLayout } from '@guardian/stand/Layout';
import { Link } from '@guardian/stand/Link';
import { LinkButton } from '@guardian/stand/LinkButton';
import type { ResponsiveTableValue } from '@guardian/stand/Table';
import {
	Table,
	TableBody,
	TableCell,
	TableColumnHeader,
	TableHeader,
	TableRow,
} from '@guardian/stand/Table';
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

const mainPadding = componentLayout.main;

// Halves the default `Layout.Main` vertical padding.
const mainStyle = css`
	min-height: 0;
	box-sizing: border-box;
	padding-inline: ${semanticSpacing.stackMd};
	padding-top: calc(${mainPadding.sm.padding.top} / 2);
	padding-bottom: calc(${mainPadding.sm.padding.bottom} / 2);

	${from.md} {
		padding-top: calc(${mainPadding.md.padding.top} / 2);
		padding-bottom: calc(${mainPadding.md.padding.bottom} / 2);
	}

	${from.lg} {
		padding-top: calc(${mainPadding.lg.padding.top} / 2);
		padding-bottom: calc(${mainPadding.lg.padding.bottom} / 2);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
`;

const LAUNCHED_LIMIT = 15;

const welcomeStyle = css`
	max-width: 1400px;
	margin: 0 auto ${semanticSpacing.stackSm};
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

// Sized to content (capped at the available height) so a short list doesn't
// stretch to match the taller one.
const sectionStyle = css`
	${from.lg} {
		display: flex;
		flex-direction: column;
		align-self: start;
		max-height: 100%;
		min-height: 0;
	}
`;

const panelStyle = css`
	${from.lg} {
		display: flex;
		flex-direction: column;
		flex: 0 1 auto;
		min-height: 0;
	}

	border: ${semanticSizing.border.default} solid ${semanticColors.border.weak};
	border-radius: ${semanticRadius.cornerSm};
	overflow: hidden;
	background-color: ${semanticColors.bg.base};
`;

const titleGroupStyle = css`
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	column-gap: ${semanticSpacing.stackSm};
	row-gap: ${semanticSpacing.stackXxs};
`;

const titleBarStyle = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${semanticSpacing.stackMd};
	min-height: 2.5rem;
	margin-bottom: ${semanticSpacing.stackSm};
`;

// The header lives inside the scroll area so it shares the rows' width
// (the scrollbar would otherwise offset the two).
const scrollAreaStyle = css`
	${from.lg} {
		flex: 0 1 auto;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
`;

// The panel provides the border; `overflow: clip` keeps the sticky header working.
const tableStyle = css`
	overflow: clip;
	border: none;
	border-radius: 0;
`;

const headerStyle = (background: string) => css`
	background-color: ${background};

	${from.lg} {
		position: sticky;
		top: 0;
		z-index: 1;
	}
`;

const rowStyle = css`
	cursor: pointer;
`;

const lastUpdatedMobileStyle = css`
	${from.md} {
		display: none;
	}
`;

const hideOnMobileStyle = css`
	${until.md} {
		display: none;
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

const subTextStyle = css`
	color: ${semanticColors.text.weak};
`;

const errorsStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackXs};
	max-width: 1400px;
	margin: 0 auto ${semanticSpacing.stackMd};
`;

const tableColumns: ResponsiveTableValue<string> = {
	sm: 'minmax(0, 1fr) auto',
	md: 'minmax(0, 1fr) 8.5rem 9.5rem',
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
				<Table
					aria-label={title}
					columns={tableColumns}
					headerVisibleFrom="sm"
					cssOverrides={tableStyle}
				>
					<TableHeader cssOverrides={headerStyle(background)}>
						<TableColumnHeader isRowHeader>Newsletters</TableColumnHeader>
						<TableColumnHeader cssOverrides={hideOnMobileStyle}>
							Last updated
						</TableColumnHeader>
						<TableColumnHeader>Status</TableColumnHeader>
					</TableHeader>
					<TableBody renderEmptyState={() => emptyText}>
						{rows.map((row) => {
							const pillarCategoryLabel = formatPillarCategoryLabel(
								row.theme,
								row.category,
							);
							const lastUpdated = formatLastUpdated(row.lastUpdated);
							return (
								<TableRow
									key={row.id}
									id={row.id}
									href={row.href}
									cssOverrides={rowStyle}
								>
									<TableCell
										gridColumn={{ sm: '1', md: '1' }}
										gridRow={{ sm: '1', md: 'auto' }}
									>
										<div css={newsletterCellStyle}>
											<NewsletterThumbnail src={row.thumbnailUrl} />
											<div css={detailsStyle}>
												<Typography element="span" variant="bodyBoldMd">
													{row.name}
												</Typography>
												{pillarCategoryLabel && (
													<Typography
														element="span"
														variant="bodySm"
														cssOverrides={subTextStyle}
													>
														{pillarCategoryLabel}
													</Typography>
												)}
												<Typography
													element="span"
													variant="bodySm"
													cssOverrides={[subTextStyle, lastUpdatedMobileStyle]}
												>
													{lastUpdated}
												</Typography>
											</div>
										</div>
									</TableCell>
									<TableCell
										gridColumn={{ sm: '1', md: '2' }}
										gridRow={{ sm: '1', md: 'auto' }}
										cssOverrides={hideOnMobileStyle}
									>
										{lastUpdated}
									</TableCell>
									<TableCell
										gridColumn={{ sm: '2', md: '3' }}
										gridRow={{ sm: '1', md: 'auto' }}
									>
										<Badge color={row.statusBadge.color} weight="strong">
											{row.statusBadge.label}
										</Badge>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
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
