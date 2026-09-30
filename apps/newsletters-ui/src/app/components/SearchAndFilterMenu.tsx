import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { SearchInput } from '@guardian/stand/SearchInput';
import { Option, Select } from '@guardian/stand/Select';
import { Typography } from '@guardian/stand/Typography';
import { from, until } from '@guardian/stand/utils';
import type {
	NewsletterCategory,
	Theme,
} from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import type { Key } from 'react-aria-components';

export const categoryOptions: Array<{
	id: NewsletterCategory;
	label: string;
}> = [
	{ id: 'article-based', label: 'Article based' },
	{ id: 'article-based-legacy', label: 'Article based legacy' },
	{ id: 'fronts-based', label: 'Fronts based' },
	{ id: 'manual-send', label: 'Manual send' },
	{ id: 'other', label: 'Other' },
];

export const pillarOptions: Array<{
	id: Theme;
	label: string;
}> = [
	{ id: 'news', label: 'News' },
	{ id: 'opinion', label: 'Opinion' },
	{ id: 'culture', label: 'Culture' },
	{ id: 'sport', label: 'Sport' },
	{ id: 'lifestyle', label: 'Lifestyle' },
	{ id: 'features', label: 'Features' },
];

const sectionStyles = css`
	background-color: ${semanticColors.bg.raisedLevel1};
	padding: ${semanticSpacing.stackMd};
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackMd};
	border-bottom: 2px solid ${semanticColors.border.weak};
	${from.lg} {
		border: none;
		border-right: 1px solid ${semanticColors.border.weak};
		padding-top: ${semanticSpacing.stackLg};
		width: 280px;
	}
`;

const headerButtonStyles = (isOpen: boolean) => css`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	background: none;
	border: none;
	padding: 0 0 ${isOpen ? semanticSpacing.stackMd : 0} 0;
	cursor: pointer;
	margin: 0;
	color: inherit;
	position: relative;

	${isOpen &&
	css`
		&::after {
			content: '';
			position: absolute;
			left: -${semanticSpacing.stackMd};
			right: -${semanticSpacing.stackMd};
			bottom: 0;
			border-bottom: 2px solid ${semanticColors.border.weak};
		}
	`}

	${from.lg} {
		display: none;
	}
`;

const chevronStyles = (isOpen: boolean) => css`
	transition: transform 0.2s ease-in-out;
	transform: ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
	flex-shrink: 0;
	margin-left: ${semanticSpacing.stackSm};
`;

const getInputContainerStyles = (isOpen: boolean) => css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackMd};

	${until.lg} {
		display: ${isOpen ? 'flex' : 'none'};
	}

	${from.lg} {
		gap: ${semanticSpacing.stackLg};
	}
`;

const multiSelectStyles = css`
	button > span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
`;

const toKeys = (value: Key | Key[] | null): Key[] =>
	Array.isArray(value) ? value : value === null ? [] : [value];

interface SearchAndFilterMenuProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	selectedCategories: NewsletterCategory[];
	onCategoryChange: (categories: NewsletterCategory[]) => void;
	selectedPillars: Theme[];
	onPillarChange: (pillars: Theme[]) => void;
}

export const SearchAndFilterMenu = ({
	searchTerm,
	onSearchChange,
	selectedCategories,
	onCategoryChange,
	selectedPillars,
	onPillarChange,
}: SearchAndFilterMenuProps) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<section css={sectionStyles}>
			<button
				css={headerButtonStyles(isOpen)}
				onClick={() => setIsOpen(!isOpen)}
				aria-expanded={isOpen}
			>
				<Typography element="span" variant="bodyBoldSm">
					All newsletters / Search and filter
				</Typography>
				<Icon
					size="sm"
					symbol="keyboard_arrow_down"
					css={chevronStyles(isOpen)}
				/>
			</button>
			<div css={getInputContainerStyles(isOpen)}>
				<SearchInput
					label="Search"
					value={searchTerm}
					onChange={onSearchChange}
				/>
				<Select
					label="Category"
					placeholder="All"
					selectionMode="multiple"
					value={selectedCategories}
					onChange={(value) =>
						onCategoryChange(toKeys(value) as NewsletterCategory[])
					}
					cssOverrides={multiSelectStyles}
				>
					{categoryOptions.map(({ id, label }) => (
						<Option key={id} id={id}>
							{label}
						</Option>
					))}
				</Select>
				<Select
					label="Pillar"
					placeholder="All"
					selectionMode="multiple"
					value={selectedPillars}
					onChange={(value) => onPillarChange(toKeys(value) as Theme[])}
					cssOverrides={multiSelectStyles}
				>
					{pillarOptions.map(({ id, label }) => (
						<Option key={id} id={id}>
							{label}
						</Option>
					))}
				</Select>
			</div>
		</section>
	);
};
