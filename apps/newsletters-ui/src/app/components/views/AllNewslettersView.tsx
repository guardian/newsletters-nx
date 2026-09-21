import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { componentLayout, Layout as StandLayout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import { useLoaderData } from 'react-router-dom';
import { isFeatureSwitchEnabled } from '../../featureSwitches';
import {
	countBlockHeight,
	layer,
	listHeaderOffsetProperty,
} from '../../lib/stand-layout';
import type { AllNewslettersData } from '../../loaders/all-newsletters';
import { AllNewslettersTable } from '../AllNewslettersTable';

// `Layout.Main`'s own padding is turned off and reproduced below: left on
// `Main`, the top padding would push the top of the scrolling area (and so
// the scrollbar) down below the top bar.
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

// The whole content area scrolls, so the scrollbar runs its full height and a
// scroll starting over the empty space either side of the list still moves
// the rows.
const scrollAreaStyle = css`
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding-inline: ${semanticSpacing.stackMd};

	${listHeaderOffsetProperty}: calc(
		${mainPadding.sm.padding.top} + ${countBlockHeight}
	);

	${from.md} {
		${listHeaderOffsetProperty}: calc(
			${mainPadding.md.padding.top} + ${countBlockHeight}
		);
	}

	${from.lg} {
		${listHeaderOffsetProperty}: calc(
			${mainPadding.lg.padding.top} + ${countBlockHeight}
		);
	}
`;

// Pinned so the count keeps its place while the rows scroll, and opaque so
// rows don't show through as they pass beneath it.
const countBlockStyle = css`
	position: sticky;
	top: 0;
	z-index: ${layer.stickyContent};
	background-color: ${semanticColors.bg.base};
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
	box-sizing: border-box;
	height: var(${listHeaderOffsetProperty});
	padding-bottom: ${semanticSpacing.stackMd};
`;

// Keeps the end of the list clear of the foot of the scrolling area. Sits on
// the list block rather than the scroller so it counts as scrollable content.
const listBlockStyle = css`
	padding-bottom: ${mainPadding.sm.padding.bottom};
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
