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
import type {
	NewsletterData,
	NewsletterValueGenerator,
} from '@newsletters-nx/newsletters-data-client';

interface Props {
	newsletter: NewsletterData;
	valueGenerator: NewsletterValueGenerator;
}

export const GeneratedDataPoint = ({ newsletter, valueGenerator }: Props) => {
	const generatedValue = valueGenerator.generate(newsletter);

	const copyToClipBoard = async () => {
		await navigator.clipboard.writeText(generatedValue);
	};

	return (
		<Grid container justifyContent={'space-between'} spacing={1}>
			<Grid item xs={3} flexGrow={1} flexShrink={0}>
				<Typography variant="caption">{'Sign up embed code'}</Typography>
				<Tooltip title={valueGenerator.description} arrow>
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
							value={generatedValue}
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
