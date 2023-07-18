import { ButtonGroup, Typography } from '@mui/material';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { NavigateButton } from './NavigateButton';
import { TemplatePreviewLoader } from './TemplatePreviewLoader';

interface Props {
	newsletter: NewsletterData;
}

export const RenderingPreviewPage = ({ newsletter }: Props) => {
	return (
		<>
			<Typography variant="h2">
				Email rendering preview: {newsletter.name}
			</Typography>
			<TemplatePreviewLoader identityName={newsletter.identityName} />

			<ButtonGroup>
				<NavigateButton href={`/newsletters/${newsletter.identityName}`}>
					back to details
				</NavigateButton>
			</ButtonGroup>
		</>
	);
};
