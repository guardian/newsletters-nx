import { css } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { componentLayout, Layout as StandLayout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import { useLoaderData } from 'react-router-dom';
import { isFeatureSwitchEnabled } from '../../featureSwitches';
import {
	stickyListBorderColorVar,
	stickyListBorderRadiusVar,
	stickyListBorderWidthVar,
	stickyListHeaderOffsetVar,
	stickyListLayerVar,
	stickyListPinnedBlockHeightVar,
} from '../../lib/stand-layout';
import type { AllNewslettersData } from '../../loaders/all-newsletters';
import { AllNewslettersTable } from '../AllNewslettersTable';

// `Layout.Main` padding is disabled and reapplied here so the scroll area can
// start at the top edge of content, directly under the top bar.
const mainPadding = componentLayout.main;

const mainStyle = css`
	display: flex;
	flex-direction: column;
	/* Lets the scrolling region shrink below the height of its rows, instead
	 * of forcing the shell taller. */
	min-height: 0;
`;

const containerStyle = css`
	max-width: 996px;
	margin-inline: auto;
	width: 100%;
	box-sizing: border-box;
`;

// This is the single scroll container for the page content. Keeping scroll
// here preserves full-height scrollbar behavior and allows sticky children.
//
// These `--sticky-list-*` vars are a local token layer consumed by the table,
// and are intended to move into Stand later with minimal app churn.
const scrollAreaStyle = css`
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding-inline: ${semanticSpacing.stackMd};
	${stickyListLayerVar}: 1;
	${stickyListPinnedBlockHeightVar}: 2.125rem;

	${stickyListHeaderOffsetVar}: calc(
		${mainPadding.sm.padding.top} + var(${stickyListPinnedBlockHeightVar})
	);

	${from.md} {
		${stickyListHeaderOffsetVar}: calc(
			${mainPadding.md.padding.top} + var(${stickyListPinnedBlockHeightVar})
		);
	}

	${from.lg} {
		${stickyListHeaderOffsetVar}: calc(
			${mainPadding.lg.padding.top} + var(${stickyListPinnedBlockHeightVar})
		);
	}
`;

// Pinned meta block above the sticky table header; opaque to prevent row bleed.
const countBlockStyle = css`
	position: sticky;
	top: 0;
	z-index: var(${stickyListLayerVar});
	background-color: ${semanticColors.bg.base};
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
	box-sizing: border-box;
	height: var(${stickyListHeaderOffsetVar});
	padding-bottom: ${semanticSpacing.stackMd};
`;

// Bottom breathing room at end-of-list; border tokens are defined here and
// consumed by the table so radius/outline styling stays coordinated.
const listBlockStyle = css`
	padding-bottom: ${mainPadding.sm.padding.bottom};
	${stickyListBorderColorVar}: ${semanticColors.border.weak};
	${stickyListBorderRadiusVar}: ${semanticRadius.cornerSm};
	${stickyListBorderWidthVar}: ${semanticSizing.border.default};
`;

const countStyle = css`
	color: ${semanticColors.text.weak};
`;

const errorsStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackXs};
`;

const sourceLabels: Record<string, string> = {
	launched: 'launched newsletters',
	draft: 'draft newsletters',
};

export const AllNewslettersView = () => {
	// `useLoaderData` is typed as `any`, which `eslint --fix` strips a plain
	// `as` cast from; the `<unknown>` type argument keeps the cast meaningful.
	const { rows, failedSources } =
		useLoaderData<unknown>() as AllNewslettersData;

	// Not worth route-level gating for a temporary, Stand-only page, so Legacy
	// design editors get a message and a link to opt in.
	if (!isFeatureSwitchEnabled('switch-stand')) {
		return (
			<StandLayout.Main>
				<div css={containerStyle}>
					<Typography element="p" variant="bodyMd">
						All Newsletters is only available with the Stand design enabled.{' '}
						<a href="/all?switch-stand=true">Enable the Stand design</a> to view
						it.
					</Typography>
				</div>
			</StandLayout.Main>
		);
	}

	return (
		<StandLayout.Main
			paddingTop={false}
			paddingBottom={false}
			cssOverrides={mainStyle}
		>
			<div css={scrollAreaStyle}>
				<div css={[containerStyle, countBlockStyle]}>
					<Typography element="p" variant="bodySm" cssOverrides={countStyle}>
						{rows.length === 1 ? '1 newsletter' : `${rows.length} newsletters`}
					</Typography>
				</div>

				<div css={[containerStyle, listBlockStyle]}>
					{failedSources.length > 0 && (
						<div css={errorsStyle}>
							{failedSources.map((source) => (
								<InlineMessage key={source} level="error">
									{`Could not load ${sourceLabels[source] ?? source}.`}
								</InlineMessage>
							))}
						</div>
					)}

					<AllNewslettersTable rows={rows} />
				</div>
			</div>
		</StandLayout.Main>
	);
};
