import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Badge } from '@guardian/stand/Badge';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import type { HubEditionHeaderBreadcrumbsProps } from './HubEditionHeaderBreadcrumbs';
import { HubEditionHeaderBreadcrumbs } from './HubEditionHeaderBreadcrumbs';
import { getLaunchedStatusBadgeContent } from './NewsletterStatusBadge';

interface HubEditionHeaderProps {
	title: string;
	breadcrumbs: HubEditionHeaderBreadcrumbsProps;
	children?: ReactNode;
}

const headerStyles = css`
	background-color: ${semanticColors.bg.raisedLevel2};
	padding: ${semanticSpacing.stackMd};
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: ${semanticSpacing.stackSm};
`;

const headingRowStyles = css`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: ${semanticSpacing.stackSm};
	margin-bottom: ${semanticSpacing.stackLg};
`;

const headingStyles = css`
	color: ${semanticColors.text.strong};
	margin: 0;
	overflow-wrap: anywhere;
`;

export const HubEditionHeader = ({
	title,
	breadcrumbs,
	children,
}: HubEditionHeaderProps) => {
	const badge = getLaunchedStatusBadgeContent('live');

	return (
		<header css={headerStyles}>
			<HubEditionHeaderBreadcrumbs {...breadcrumbs} />
			<div css={headingRowStyles}>
				<Typography
					element="h2"
					variant="headingCompact2Xl"
					cssOverrides={headingStyles}
				>
					{title}
				</Typography>
				<Badge color={badge.color} weight="strong" size="xs">
					{badge.label}
				</Badge>
			</div>
			{children}
		</header>
	);
};
