import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { SearchInput } from '@guardian/stand/SearchInput';
import { Typography } from '@guardian/stand/Typography';
import { from, until } from '@guardian/stand/utils';
import { useState } from 'react';

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
	${until.lg} {
		display: ${isOpen ? 'block' : 'none'};
	}
`;

interface SearchAndFilterMenuProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
}

export const SearchAndFilterMenu = ({
	searchTerm,
	onSearchChange,
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
					label="search"
					value={searchTerm}
					onChange={onSearchChange}
				/>
			</div>
		</section>
	);
};
