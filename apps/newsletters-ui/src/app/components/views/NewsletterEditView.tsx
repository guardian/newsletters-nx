import { Box } from '@mui/material';
import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { useLoaderData } from 'react-router-dom';
import { ContentWrapper } from '../../ContentWrapper';
import { isFeatureSwitchEnabled } from '../../featureSwitches';
import { hasNewsletterLayout } from '../../lib/newsletter-layout';
import { EditNewsletterForm } from '../EditNewsletterForm';
import { NavigateButton } from '../NavigateButton';

export const NewsletterEditView = () => {
	const matchedItem = useLoaderData<unknown>();
	const isLegacy = isFeatureSwitchEnabled('switch-legacy');
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}

	if (!isNewsletterData(matchedItem)) {
		return <article>NOT VALID DATA!</article>;
	}

	return (
		<ContentWrapper>
			<Box sx={{ marginBottom: 2 }}>
				<NavigateButton href="../" variant="outlined">
					Back to List
				</NavigateButton>
				{(isLegacy || hasNewsletterLayout(matchedItem.category)) && (
					<NavigateButton
						href={`/launched/rendering-options/${encodeURIComponent(matchedItem.identityName)}`}
						variant="outlined"
					>
						{isLegacy ? 'Edit Rendering Options' : 'Newsletter layout'}
					</NavigateButton>
				)}
			</Box>
			<EditNewsletterForm originalItem={matchedItem} />
		</ContentWrapper>
	);
};
