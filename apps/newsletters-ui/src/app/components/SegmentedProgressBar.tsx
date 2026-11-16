import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSizing,
} from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { until } from '@guardian/stand/utils';
import type React from 'react';
import { useId } from 'react';

// Stand has no progress bar, so this one is built locally from its tokens.
// It only knows about numbers, so it can be reused outside of drafts.

interface SegmentedProgressBarProps {
	/** Bold text on the left, also used as the progress bar's accessible name. */
	label: string;
	/** How many steps are finished. Clamped to between 0 and `total`. */
	completed: number;
	/** How many steps there are; one segment is drawn for each. */
	total: number;
	/**
	 * Right-aligned count, also read out by screen readers.
	 * Defaults to e.g. "4 of 5 steps complete".
	 */
	countLabel?: string;
	/** Shown to the right of the bar, and underneath it below the md (830px) breakpoint. */
	actions?: React.ReactNode;
}

const rootStyle = css`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${baseSpacing['16Px']};

	${until.md} {
		flex-direction: column;
		align-items: stretch;
	}
`;

const barStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${baseSpacing['8Px']};
	flex: 1 1 auto;
	min-width: 0;
`;

const headingStyle = css`
	display: flex;
	flex-flow: row wrap;
	justify-content: space-between;
	align-items: baseline;
	gap: ${baseSpacing['8Px']};
`;

const labelStyle = css`
	color: ${semanticColors.text.strong};
`;

const countStyle = css`
	color: ${semanticColors.text.weak};
	margin-left: auto;
	text-align: right;
`;

const segmentsStyle = css`
	display: flex;
	gap: ${baseSpacing['4Px']};
`;

const segmentStyle = css`
	flex: 1 1 0;
	height: ${baseSpacing['8Px']};
	box-sizing: border-box;
	border-radius: ${semanticRadius.cornerSm};
	border: ${semanticSizing.border.default} solid ${semanticColors.border.weak};
	background: ${semanticColors.fill.weak};
`;

const completedSegmentStyle = css`
	border-color: ${semanticColors.border.accent};
	background: ${semanticColors.fill.accentStrong};
`;

const actionsStyle = css`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	gap: ${baseSpacing['12Px']};
	flex: 0 0 auto;
`;

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

export const SegmentedProgressBar = ({
	label,
	completed,
	total,
	countLabel,
	actions,
}: SegmentedProgressBarProps) => {
	const labelId = useId();
	const steps = Math.max(0, Math.floor(total));
	const done = clamp(Math.floor(completed), 0, steps);
	const count = countLabel ?? `${done} of ${steps} steps complete`;

	return (
		<div css={rootStyle}>
			<div
				css={barStyle}
				role="progressbar"
				aria-labelledby={labelId}
				aria-valuemin={0}
				aria-valuemax={steps}
				aria-valuenow={done}
				aria-valuetext={count}
			>
				<div css={headingStyle}>
					<Typography
						id={labelId}
						element="span"
						variant="headingMd"
						cssOverrides={labelStyle}
					>
						{label}
					</Typography>
					<Typography element="span" variant="bodySm" cssOverrides={countStyle}>
						{count}
					</Typography>
				</div>
				<div css={segmentsStyle} aria-hidden="true">
					{Array.from({ length: steps }, (_, index) => (
						<span
							key={index}
							css={[segmentStyle, index < done && completedSegmentStyle]}
							data-testid="progress-segment"
							data-complete={index < done}
						/>
					))}
				</div>
			</div>
			{actions && <div css={actionsStyle}>{actions}</div>}
		</div>
	);
};
