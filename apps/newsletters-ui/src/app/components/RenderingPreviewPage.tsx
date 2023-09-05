import { ButtonGroup, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type {
	EmailRenderingOutput,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { fetchApiData } from '../api-requests/fetch-api-data';
import { NavigateButton } from './NavigateButton';
import { TemplatePreview } from './TemplatePreview';

interface Props {
	newsletter: NewsletterData;
}

export const RenderingPreviewPage = ({ newsletter }: Props) => {
	const [content, setContent] = useState<string | undefined>(undefined);

	const fetchData = useCallback(async () => {
		const data = await fetchApiData<EmailRenderingOutput>(
			`/api/rendering-templates/preview/${newsletter.identityName}`,
		);
		if (data) {
			setContent(data.html);
		}
	}, [newsletter]);

	useEffect(() => {
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
