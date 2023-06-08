import { Box } from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { EditNewsletterForm } from '../EditNewsletterForm';
import { NavigateButton } from '../NavigateButton';

export const NewsletterEditView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}

	if (!isNewsletterData(matchedItem)) {
		return <article>NOT VALID DATA!</article>;
	}

	return (
		<ContentWrapper>
			<Box marginBottom={2}>
				<NavigateButton href="../" variant="outlined">
					Back to List
				</NavigateButton>
			</Box>
			<EditNewsletterForm originalItem={matchedItem} />
		</ContentWrapper>
	);
};
