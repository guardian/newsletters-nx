import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { IconButton } from '@guardian/stand/IconButton';
import { SearchInput } from '@guardian/stand/SearchInput';
import { Typography } from '@guardian/stand/Typography';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import { NewsletterStatusBadge } from '../NewsletterStatusBadge';
import { NewsletterThumbnail } from '../NewsletterThumbnail';

const panelStyles = css`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: ${semanticSpacing.stackMd};
	padding: ${semanticSpacing.stackMd};
	background-color: ${semanticColors.bg.base};
`;

const searchStyles = css`
	width: 300px;
	max-width: 450px;
`;

const resultsStyles = css`
	list-style: none;
	margin: 0;
	padding: 0;
	width: 100%;
	max-height: 192px;
	overflow-y: auto;
	border: 1px solid ${semanticColors.border.weak};
`;

const resultStyles = css`
	display: flex;
	align-items: center;
	gap: ${semanticSpacing.stackMd};
	min-height: 84px;
	padding: ${semanticSpacing.stackSm} ${semanticSpacing.stackMd};
	background-color: ${semanticColors.fill.weak};
	border-top: 1px solid ${semanticColors.border.weak};
	&:first-of-type {
		border-top: none;
	}
`;

const detailsStyles = css`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: ${semanticSpacing.stackXs};
`;

const nameStyles = css`
	margin: 0;
`;

// Only launched newsletters can be placed in a layout. Cancelled ones
// wouldn't be shown on the site; drafts have no launched data at all.
export const isAddableStatus = (status: NewsletterData['status']): boolean =>
	status === 'live' || status === 'pending' || status === 'paused';

interface Props {
	sectionTitle: string;
	newsletters: NewsletterData[];
	onAdd: (identityName: string) => void;
	onClose: () => void;
	disabled?: boolean;
}

export const AddNewsletterPanel = ({
	sectionTitle,
	newsletters,
	onAdd,
	onClose,
	disabled,
}: Props) => {
	const [searchText, setSearchText] = useState('');
	const term = searchText.trim().toLowerCase();
	const results = term
		? newsletters.filter((n) => n.name.toLowerCase().includes(term))
		: newsletters;

	return (
		<div css={panelStyles} role="region" aria-label="Add newsletters">
			<Button variant="tertiary" size="sm" icon="close" onPress={onClose}>
				Close
			</Button>
			<SearchInput
				placeholder="Search"
				cssOverrides={searchStyles}
				aria-label={`Search newsletters to add to ${sectionTitle}`}
				value={searchText}
				onChange={setSearchText}
			/>
			<ul css={resultsStyles}>
				{results.map((newsletter) => (
					<li key={newsletter.identityName} css={resultStyles}>
						<IconButton
							symbol="add"
							size="sm"
							variant="secondary"
							ariaLabel={`Add ${newsletter.name}`}
							isDisabled={disabled}
							onPress={() => onAdd(newsletter.identityName)}
						/>
						<NewsletterThumbnail
							src={
								newsletter.illustrationSquare ??
								newsletter.illustrationCircle ??
								newsletter.illustrationCard
							}
						/>
						<div css={detailsStyles}>
							<Typography
								element="p"
								variant="bodyBoldMd"
								cssOverrides={nameStyles}
							>
								{newsletter.name}
							</Typography>
							<NewsletterStatusBadge newsletter={newsletter} />
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};
