import CopyAllIcon from '@mui/icons-material/CopyAll';
import {
	Box,
	Button,
	Chip,
	Grid,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';

interface Props {
	newsletter: NewsletterData;
}

const tooltip =
	'The HTML code to paste into a composer embed block to add a sign-up form to the article content.';

const generateEmbedCode = ({ identityName }: NewsletterData) =>
	`<iframe id="${identityName}" name="${identityName}" src="https://www.theguardian.com/email/form/plaintone/${identityName}" scrolling="no" seamless="" class="iframed--overflow-hidden email-sub__iframe" height="52px" frameborder="0" data-component="email-embed--${identityName}"></iframe>`;

export const EmbedCode = ({ newsletter }: Props) => {
	const copyToClipBoard = async () => {
		await navigator.clipboard.writeText(generateEmbedCode(newsletter));
	};

	return (
		<Grid container justifyContent={'space-between'} spacing={1}>
			<Grid item xs={3} flexGrow={1} flexShrink={0}>
				<Typography variant="caption">{'Sign up embed code'}</Typography>
				<Tooltip title={tooltip} arrow>
					<Chip size="small" label="?" />
				</Tooltip>
			</Grid>
			<Grid item xs={9} flexShrink={1}>
				<Stack direction={'row'}>
					<Box flex={1} display={'flex'}>
						<textarea
							style={{
								width: '100%',
								display: 'flex',
								resize: 'none',
								minHeight: 100,
							}}
							value={generateEmbedCode(newsletter)}
							readOnly
						/>
					</Box>
					<Button onClick={copyToClipBoard} startIcon={<CopyAllIcon />}>
						copy
					</Button>
				</Stack>
			</Grid>
		</Grid>
	);
};
