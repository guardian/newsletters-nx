import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Link } from '@guardian/stand/Link';
import { Typography } from '@guardian/stand/Typography';
import { until } from '@guardian/stand/utils';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { ReactNode } from 'react';
import { humanize } from '../lib/format';
import { NewsletterStatusBadge } from './NewsletterStatusBadge';
import { StandPanel } from './StandPanel';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

// One grid across all the panels, so the label column is as wide as the
// widest label in any panel. Panels and lists pass it down with subgrid.
const panelsStyles = css`
	display: grid;
	grid-template-columns: max-content minmax(0, 1fr);
	column-gap: ${semanticSpacing.stackSm};
	row-gap: ${semanticSpacing.stackMd};
	margin-top: ${semanticSpacing.stackMd};

	/* Values wrap underneath their labels. */
	${until.md} {
		grid-template-columns: minmax(0, 1fr);
	}
`;

const listStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	row-gap: ${semanticSpacing.stackSm};
	margin: 0;
`;

const rowStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	align-items: start;
	row-gap: ${semanticSpacing.stackXxs};
`;

const sectionStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	row-gap: ${semanticSpacing.stackSm};

	& + & {
		margin-top: ${baseSpacing['12Px']};
		padding-top: ${baseSpacing['12Px']};
		border-top: 1px solid ${semanticColors.border.weak};
	}
`;

const subheadingStyles = css`
	grid-column: 1 / -1;
	margin: 0;
`;

const weakTextStyles = css`
	color: ${semanticColors.text.weak};
`;

const valueStyles = css`
	margin: 0;
	color: ${semanticColors.text.strong};
	overflow-wrap: anywhere;
`;

const isEmpty = (value: ReactNode) =>
	value === undefined || value === null || value === '';

const Field = ({
	label,
	children,
}: {
	label: string;
	children?: ReactNode;
}) => (
	<div css={rowStyles}>
		<Typography element="dt" variant="bodySm" cssOverrides={weakTextStyles}>
			{label}
		</Typography>
		<Typography element="dd" variant="bodySm" cssOverrides={valueStyles}>
			{isEmpty(children) ? (
				<Typography
					element="span"
					variant="bodyXs"
					cssOverrides={weakTextStyles}
				>
					Not set
				</Typography>
			) : (
				children
			)}
		</Typography>
	</div>
);

export const NewsletterDetailPanels = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => (
	<div css={panelsStyles}>
		<StandPanel name="Attributes" id="attributes" subgrid>
			<dl css={listStyles}>
				<Field label="Name">{newsletter.name}</Field>
				<Field label="Newsletter status">
					<NewsletterStatusBadge newsletter={newsletter} size="xs" />
				</Field>
				<Field label="Pillar">{humanize(newsletter.theme)}</Field>
				<Field label="Region focus">{newsletter.regionFocus}</Field>
				<Field label="Frequency">{newsletter.frequency}</Field>
				<Field label="Type of newsletter">
					{humanize(newsletter.category)}
				</Field>
				<Field label="MMA group">{newsletter.group}</Field>
			</dl>
		</StandPanel>
		<StandPanel name="Sign-up page and tags" id="sign-up-page-and-tags" subgrid>
			<div css={sectionStyles}>
				<Typography
					element="h4"
					variant="bodyBoldSm"
					cssOverrides={subheadingStyles}
				>
					Sign-up page
				</Typography>
				<dl css={listStyles}>
					<Field label="Sign-up page creation status">
						<WorkflowStatusBadge status={newsletter.signupPageCreationStatus} />
					</Field>
					<Field label="Path to sign-up page">
						{newsletter.signupPage ? (
							<Link href={`https://theguardian.com${newsletter.signupPage}`}>
								{newsletter.signupPage}
							</Link>
						) : undefined}
					</Field>
				</dl>
			</div>
			<div css={sectionStyles}>
				<Typography
					element="h4"
					variant="bodyBoldSm"
					cssOverrides={subheadingStyles}
				>
					Tags
				</Typography>
				<dl css={listStyles}>
					<Field label="Tag creation status">
						<WorkflowStatusBadge status={newsletter.tagCreationStatus} />
					</Field>
					<Field label="Series tag">{newsletter.seriesTag}</Field>
					<Field label="Tag description">
						{newsletter.seriesTagDescription}
					</Field>
					<Field label="Campaign tag">{newsletter.composerTag}</Field>
					<Field label="Campaign description">
						{newsletter.composerCampaignTag}
					</Field>
				</dl>
			</div>
		</StandPanel>
	</div>
);
