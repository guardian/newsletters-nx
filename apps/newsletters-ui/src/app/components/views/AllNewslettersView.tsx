import { css } from '@emotion/react';
import {
	componentLayout,
	semanticBreakpoints,
	semanticColors,
	semanticSpacing,
} from '@guardian/stand';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Layout as StandLayout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { useLayoutEffect, useRef, useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { useHref, useLoaderData, useNavigate } from 'react-router-dom';
import type { AllNewslettersData } from '../../loaders/all-newsletters';
import { AllNewslettersList } from '../AllNewslettersList';

const mainPadding = componentLayout.main;

// The Stand shell is pinned to the viewport on this route, so Main fills the
// remaining height and is the only thing that scrolls. It deliberately stays
// full-bleed so the wheel works anywhere in the content area, including the
// margins either side of the content; the Stand content width is applied to an
// inner wrapper instead. The top padding moves onto the pinned block below so
// that rows do not scroll through the gap above it.
const mainOverrides = css`
	width: 100%;
	min-height: 0;
	overflow-y: auto;
`;

const contentStyle = css`
	max-width: ${mainPadding.maxWidth};
	margin-inline: auto;
`;

// Pinned above the rows. It is opaque and sits above the table's own sticky
// header so rows disappear behind it cleanly as they scroll.
const pinnedStyle = css`
	position: sticky;
	top: 0;
	z-index: 2;
	background-color: ${semanticColors.bg.base};
	padding-top: ${mainPadding.sm.padding.top};

	@media (min-width: ${semanticBreakpoints.md}) {
		padding-top: ${mainPadding.md.padding.top};
	}

	@media (min-width: ${semanticBreakpoints.lg}) {
		padding-top: ${mainPadding.lg.padding.top};
	}
`;

// Spacing below the pinned block uses padding rather than margin so the gap it
// leaves is painted, instead of letting rows show through it.
const headerStyle = css`
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	justify-content: space-between;
	gap: ${semanticSpacing.stackXs};
	padding-bottom: ${semanticSpacing.stackMd};
`;

const countStyle = css`
	color: ${semanticColors.text.weak};
`;

const errorsStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackXs};
	padding-bottom: ${semanticSpacing.stackMd};
`;

const sourceLabels = {
	launched: 'launched newsletters',
	draft: 'draft newsletters',
} as const;

/**
 * Tracks the height of the pinned block so the table's own sticky header can
 * come to rest directly beneath it rather than behind it.
 */
const usePinnedHeight = () => {
	const ref = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState(0);

	useLayoutEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}
		const observer = new ResizeObserver(() => {
			// getBoundingClientRect keeps the fractional height; offsetHeight
			// rounds it, which leaves the table header resting a subpixel behind
			// this block.
			setHeight(element.getBoundingClientRect().height);
		});
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, []);

	return [ref, height] as const;
};

export const AllNewslettersView = () => {
	const { rows, failedSources } =
		useLoaderData<unknown>() as AllNewslettersData;
	const navigate = useNavigate();
	const [pinnedRef, pinnedHeight] = usePinnedHeight();

	return (
		// Lets Stand's react-aria row links navigate through react-router rather
		// than triggering a full page load.
		<RouterProvider navigate={(to) => void navigate(to)} useHref={useHref}>
			<StandLayout.Main paddingTop={false} cssOverrides={mainOverrides}>
				<div css={contentStyle}>
					<div ref={pinnedRef} css={pinnedStyle}>
						<div css={headerStyle}>
							<Typography element="h1" variant="headingLg">
								All newsletters
							</Typography>
							<Typography element="p" variant="bodySm" cssOverrides={countStyle}>
								{rows.length === 1
									? '1 newsletter'
									: `${rows.length} newsletters`}
							</Typography>
						</div>

						{failedSources.length > 0 && (
							<div css={errorsStyle}>
								{failedSources.map((source) => (
									<InlineMessage key={source} level="error">
										{`Could not load ${sourceLabels[source]}. The rows below may be incomplete.`}
									</InlineMessage>
								))}
							</div>
						)}
					</div>

					<AllNewslettersList rows={rows} stickyHeaderOffset={pinnedHeight} />
				</div>
			</StandLayout.Main>
		</RouterProvider>
	);
};
