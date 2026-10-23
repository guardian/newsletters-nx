import { css } from '@emotion/react';
import {
	baseSizing,
	baseSpacing,
	semanticColors,
	semanticRadius,
} from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import type React from 'react';

interface StandPanelProps {
	name: string;
	id?: string;

	/** Displayed in top-right of header */
	actions?: React.ReactNode;

	/** Displayed in body */
	children?: React.ReactNode;

	/**
	 * Pass the parent grid's columns through to the body (CSS subgrid), so
	 * content lines up across panels. The parent must be a grid.
	 */
	subgrid?: boolean;
}

const wrapperStyle = css`
	display: flex;
	flex-flow: column nowrap;
`;

const subgridStyle = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
`;

const subgridHeadStyle = css`
	grid-column: 1 / -1;
`;

const headStyle = css`
	padding: ${baseSpacing['8Rem']} ${baseSpacing['16Rem']};
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-between;
	align-items: center;
	background: ${semanticColors.fill.neutralWeak};
	min-height: ${baseSizing.size48Px};

	/** border **/
	border-radius: ${semanticRadius.cornerSm} ${semanticRadius.cornerSm} 0 0;
	border: 1px solid ${semanticColors.border.weak};
`;

const bodyStyle = css`
	padding: ${baseSpacing['16Rem']};
	min-height: ${baseSizing.size16Rem};
	flex: 1 0 auto;

	/** border **/
	border-radius: 0 0 ${semanticRadius.cornerSm} ${semanticRadius.cornerSm};

	border: 1px solid ${semanticColors.border.weak};
	border-top: none;
`;

export const StandPanel = ({
	id,
	children,
	name,
	actions,
	subgrid = false,
}: StandPanelProps) => {
	return (
		<section id={id} css={[wrapperStyle, subgrid && subgridStyle]}>
			<header css={[headStyle, subgrid && subgridHeadStyle]}>
				<Typography element="h3" variant="bodyBoldMd">
					{name}
				</Typography>
				{actions}
			</header>
			<div css={[bodyStyle, subgrid && subgridStyle]}>{children}</div>
		</section>
	);
};
