import {
	Alert,
	AlertTitle,
	Box,
	Container,
	Grid,
	Link,
	Typography,
} from '@mui/material';
import type { RenderingTemplate } from '../loaders/rendering-templates';

interface Props {
	templates: RenderingTemplate[];
}

const EMAIL_RENDERING_CHROMATIC_MAIN =
	'https://main--62594e0fc60998003a3c15a8.chromatic.com';

const getChromaticURL = (template: RenderingTemplate): string => {
	switch (template.id) {
		case 'pushing-buttons':
			return `${EMAIL_RENDERING_CHROMATIC_MAIN}/?path=/story/templates-pushing-buttons--primary`;
		case 'first-edition':
			return `${EMAIL_RENDERING_CHROMATIC_MAIN}/?path=/story/playground-content--default&args=editBody:false;template:first-edition`;
		default:
			return `${EMAIL_RENDERING_CHROMATIC_MAIN}/?path=/story/templates-primarytemplate--${template.id}`;
	}
};

export const TemplateList = ({ templates }: Props) => {
	return (
		<Container maxWidth="lg">
			<Typography variant="h2">Email Rendering Templates</Typography>
			<Typography variant="subtitle2">
				{templates.length} templates implemented in the email-rendering service.
			</Typography>

			<Box component="ul">
				{templates.map((template) => (
					<Grid
						container
						spacing={2}
						component={'li'}
						marginBottom={1}
						key={template.id}
					>
						<Grid item xs={8}>
							<Link target="_blank" href={getChromaticURL(template)}>
								<Typography>{template.title}</Typography>
							</Link>
						</Grid>
						<Grid item xs={2}>
							<Typography sx={{ fontWeight: 'bold' }}>
								{template.status}
							</Typography>
						</Grid>
						<Grid item xs={2}></Grid>
					</Grid>
				))}
			</Box>

			<Box maxWidth={'sm'}>
				<Alert severity="info">
					<AlertTitle>Please note</AlertTitle>
					<div>
						Implementing and updating templates in email-rendering requires
						manual action by the dev team. Changes made in the tool will not
						automatically be reflected in this list.
					</div>
					<div>If in doubt, please contact the dev team.</div>
				</Alert>
			</Box>
		</Container>
	);
};
