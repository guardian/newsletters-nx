import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSpacing,
	semanticTypography,
} from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { Link } from 'react-router-dom';

export interface HubEditionBreadcrumb {
	label: string;
	href: string;
}

export interface HubEditionHeaderBreadcrumbsProps {
	ancestors: HubEditionBreadcrumb[];
	currentLabel: string;
}

const listStyles = css`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	row-gap: ${semanticSpacing.stackXs};
	list-style: none;
	margin: 0;
	padding: 0;

	li {
		display: flex;
		align-items: center;
	}

	li + li::before {
		content: '>';
		color: ${semanticColors.text.strong};
		font: ${semanticTypography.bodyXs.font};
		flex-shrink: 0;
		margin-inline: 1ch;
	}
`;

const textStyles = css`
	color: ${semanticColors.text.strong};
`;

const linkStyles = css`
	color: inherit;
	text-decoration: underline;
`;

export const HubEditionHeaderBreadcrumbs = ({
	ancestors,
	currentLabel,
}: HubEditionHeaderBreadcrumbsProps) => (
	<nav aria-label="Breadcrumb">
		<ol css={listStyles}>
			{ancestors.map(({ label, href }) => (
				<li key={href}>
					<Typography element="span" variant="bodyXs" cssOverrides={textStyles}>
						<Link to={href} css={linkStyles}>
							{label}
						</Link>
					</Typography>
				</li>
			))}
			<li aria-current="page">
				<Typography element="span" variant="bodyXs" cssOverrides={textStyles}>
					{currentLabel}
				</Typography>
			</li>
		</ol>
	</nav>
);
