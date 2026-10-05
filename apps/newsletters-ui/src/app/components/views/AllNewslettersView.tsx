import { css } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { componentLayout, Layout as StandLayout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import type {
	NewsletterCategory,
	Theme,
} from '@newsletters-nx/newsletters-data-client';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import { isFeatureSwitchEnabled } from '../../featureSwitches';
import {
	stickyListHeaderOffsetVar,
	stickyListLayerVar,
} from '../../lib/stand-layout';
import type { AllNewslettersData } from '../../loaders/all-newsletters';
import { AllNewslettersTable } from '../AllNewslettersTable';
import { FailedSourcesMessages } from '../home/FailedSourcesMessages';
import type { NewsletterStatus } from '../NewsletterStatusBadge';
import {
	categoryOptions,
	pillarOptions,
	SearchAndFilterMenu,
	sortOptions,
	statusOptions,
} from '../SearchAndFilterMenu';
import type { NewsletterSort } from '../SearchAndFilterMenu';

// `Layout.Main` padding is disabled and reapplied here so the scroll area can
// start at the top edge of content, directly under the top bar.
const mainPadding = componentLayout.main;

// Height of the pinned count block above the sticky table header, used to
// derive the header offset and to size `countBlockStyle`.
const pinnedBlockHeight = '2.125rem';

const mainStyle = css`
	display: flex;
	flex-direction: column;
	/* Lets the scrolling region shrink below the height of its rows, instead
	 * of forcing the shell taller. */
	min-height: 0;
	${from.lg} {
		flex-direction: row;
	}
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
// `--sticky-list-header-offset` and `--sticky-list-layer` are a local token
// layer consumed by the table, and are intended to move into Stand later
// with minimal app churn.
const scrollAreaStyle = css`
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding-inline: ${semanticSpacing.stackMd};
	${stickyListLayerVar}: 1;

	${stickyListHeaderOffsetVar}: calc(
		${mainPadding.sm.padding.top} + ${pinnedBlockHeight}
	);

	${from.md} {
		${stickyListHeaderOffsetVar}: calc(
			${mainPadding.md.padding.top} + ${pinnedBlockHeight}
		);
	}

	${from.lg} {
		${stickyListHeaderOffsetVar}: calc(
			${mainPadding.lg.padding.top} + ${pinnedBlockHeight}
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

// Bottom breathing room at end-of-list.
const listBlockStyle = css`
	padding-bottom: ${mainPadding.sm.padding.bottom};
`;

const countStyle = css`
	color: ${semanticColors.text.weak};
`;

const errorMessageStyle = css`
	background-color: ${semanticColors.fill.errorWeaker};
	border: 1px solid ${semanticColors.border.error};
	border-radius: ${semanticRadius.cornerSm};
	padding: ${semanticSpacing.stackSm} ${semanticSpacing.stackMd};
`;

export const allNewslettersSearchParam = 'search';
export const allNewslettersCategoryParam = 'category';
export const allNewslettersPillarParam = 'pillar';
export const allNewslettersStatusParam = 'status';
export const allNewslettersSortParam = 'sort';

const categoryValues = new Set<string>(categoryOptions.map(({ id }) => id));
const pillarValues = new Set<string>(pillarOptions.map(({ id }) => id));
const statusValues = new Set<string>(statusOptions.map(({ id }) => id));
const sortValues = new Set<string>(sortOptions.map(({ id }) => id));

export const AllNewslettersView = () => {
	// `useLoaderData` is typed as `any`, which `eslint --fix` uses to strip a
	// plain `as` cast; the `<unknown>` type argument keeps the cast meaningful.
	const { rows, failedSources } =
		useLoaderData<unknown>() as AllNewslettersData;
	const [searchParams, setSearchParams] = useSearchParams();
	const searchTerm = searchParams.get(allNewslettersSearchParam) ?? '';
	const selectedCategories = searchParams
		.getAll(allNewslettersCategoryParam)
		.filter((value): value is NewsletterCategory => categoryValues.has(value));
	const selectedPillars = searchParams
		.getAll(allNewslettersPillarParam)
		.filter((value): value is Theme => pillarValues.has(value));
	const selectedStatuses = searchParams
		.getAll(allNewslettersStatusParam)
		.filter((value): value is NewsletterStatus => statusValues.has(value));
	const selectedSort: NewsletterSort = sortValues.has(
		searchParams.get(allNewslettersSortParam) ?? '',
	)
		? (searchParams.get(allNewslettersSortParam) as NewsletterSort)
		: 'most-recent';

	const setSearchTerm = (value: string) => {
		setSearchParams(
			(previous) => {
				const next = new URLSearchParams(previous);
				if (value) {
					next.set(allNewslettersSearchParam, value);
				} else {
					next.delete(allNewslettersSearchParam);
				}
				return next;
			},
			// Replace so each keystroke doesn't add a history entry.
			{ replace: true },
		);
	};

	const setMultiValueParam = (param: string, values: string[]) => {
		setSearchParams(
			(previous) => {
				const next = new URLSearchParams(previous);
				next.delete(param);
				values.forEach((value) => next.append(param, value));
				return next;
			},
			{ replace: true },
		);
	};

	const normalisedSearchTerm = searchTerm.trim().toLowerCase();
	const filteredRows = rows.filter((row) => {
		const matchesSearch = row.name.toLowerCase().includes(normalisedSearchTerm);
		const matchesCategory =
			selectedCategories.length === 0 ||
			(row.category !== undefined && selectedCategories.includes(row.category));
		const matchesPillar =
			selectedPillars.length === 0 ||
			(row.theme !== undefined && selectedPillars.includes(row.theme));
		const matchesStatus =
			selectedStatuses.length === 0 || selectedStatuses.includes(row.status);
		return matchesSearch && matchesCategory && matchesPillar && matchesStatus;
	});
	const filteredAndSortedRows = [...filteredRows].sort((firstRow, secondRow) =>
		selectedSort === 'newsletter-name'
			? firstRow.name.localeCompare(secondRow.name) ||
				firstRow.id.localeCompare(secondRow.id)
			: 0,
	);

	const setSort = (sort: NewsletterSort) => {
		setSearchParams(
			(previous) => {
				const next = new URLSearchParams(previous);
				next.set(allNewslettersSortParam, sort);
				return next;
			},
			{ replace: true },
		);
	};

	// This view is part of the Stand design. It's not worth building real
	// route-level gating for what's a temporary, Stand-only page, so Legacy
	// design editors who land here just get a message and a link to opt in.
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
			<SearchAndFilterMenu
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				selectedCategories={selectedCategories}
				onCategoryChange={(categories) =>
					setMultiValueParam(allNewslettersCategoryParam, categories)
				}
				selectedPillars={selectedPillars}
				onPillarChange={(pillars) =>
					setMultiValueParam(allNewslettersPillarParam, pillars)
				}
				selectedStatuses={selectedStatuses}
				onStatusChange={(statuses) =>
					setMultiValueParam(allNewslettersStatusParam, statuses)
				}
				selectedSort={selectedSort}
				onSortChange={setSort}
			/>
			<section css={scrollAreaStyle}>
				<div css={[containerStyle, countBlockStyle]}>
					<Typography element="p" variant="bodySm" cssOverrides={countStyle}>
						{filteredAndSortedRows.length === 1
							? '1 newsletter'
							: `${filteredAndSortedRows.length} newsletters`}
					</Typography>
				</div>

				<div css={[containerStyle, listBlockStyle]}>
					<FailedSourcesMessages
						failedSources={failedSources}
						messageStyle={errorMessageStyle}
					/>

					<AllNewslettersTable rows={filteredAndSortedRows} />
				</div>
			</section>
		</StandLayout.Main>
	);
};
