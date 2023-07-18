import { ButtonGroup, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { fetchApiData } from '../api-requests/fetch-api-data';
import { NavigateButton } from './NavigateButton';
import { TemplatePreview } from './TemplatePreview';
import { TemplatePreviewLoader } from './TemplatePreviewLoader';

interface Props {
	newsletter: NewsletterData;
}

export const RenderingPreviewPage = ({ newsletter }: Props) => {
	const [content, setContent] = useState<string | undefined>(undefined);

	const fetchData = useCallback(async () => {
		const data = await fetchApiData<{ content: string }>(
			`/api/rendering-templates/preview/${newsletter.identityName}`,
		);
		if (data) {
			setContent(data.content);
		}
	}, [newsletter]);

	useEffect(() => {
		console.log('fetch');
		void fetchData();
	}, [fetchData]);

	return (
		<>
			<Typography variant="h2">
				Email rendering preview: {newsletter.name}
			</Typography>
			<TemplatePreview html={content} isLoading={!content} />

			<ButtonGroup>
				<NavigateButton href={`/newsletters/${newsletter.identityName}`}>
					back to details
				</NavigateButton>
			</ButtonGroup>
		</>
	);
};
