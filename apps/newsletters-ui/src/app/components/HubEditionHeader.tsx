import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import type { HubEditionHeaderBreadcrumbsProps } from './HubEditionHeaderBreadcrumbs';
import { HubEditionHeaderBreadcrumbs } from './HubEditionHeaderBreadcrumbs';

interface HubEditionHeaderProps {
	title: string;
	breadcrumbs: HubEditionHeaderBreadcrumbsProps;
	actions?: ReactNode;
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
	align-items: center;
	justify-content: space-between;
	gap: ${semanticSpacing.stackSm};
	width: 100%;
`;

const headingRowWithChildrenStyles = css`
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
	actions,
	children,
}: HubEditionHeaderProps) => {
	return (
		<header css={headerStyles}>
			<HubEditionHeaderBreadcrumbs {...breadcrumbs} />
			<div css={[headingRowStyles, children && headingRowWithChildrenStyles]}>
				<Typography
					element="h2"
					variant="headingCompact2Xl"
					cssOverrides={headingStyles}
				>
					{title}
				</Typography>
				{actions}
			</div>
			{children}
		</header>
	);
};
