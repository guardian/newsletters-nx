import CopyAllIcon from '@mui/icons-material/CopyAll';
import {
	Box,
	Button,
	Chip,
	Grid,
	Link,
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
	includeCopyButton?: boolean;
}

const isUrl = (text: string): boolean => {
	try {
		new URL(text);
		return true;
	} catch {
		return false;
	}
};

export const GeneratedDataPoint = ({
	newsletter,
	valueGenerator,
	includeCopyButton,
}: Props) => {
	const generatedValue = valueGenerator.generate(newsletter);

	const copyToClipBoard = async () => {
		await navigator.clipboard.writeText(generatedValue);
	};

	const valueIsUrl = isUrl(generatedValue);

	return (
		<Grid container justifyContent={'space-between'} spacing={1}>
			<Grid item xs={3} flexGrow={1} flexShrink={0}>
				<Typography variant="caption">{valueGenerator.displayName}</Typography>
				<Tooltip title={valueGenerator.description} arrow>
					<Chip size="small" label="?" />
				</Tooltip>
			</Grid>
			<Grid item xs={9} flexShrink={1}>
				<Stack direction={'row'}>
					{includeCopyButton ? (
						<>
							<Box flex={1} display={'flex'}>
								<textarea
									style={{
										width: '100%',
										display: 'flex',
										minHeight: 80,
										resize: 'none',
									}}
									value={generatedValue}
									readOnly
								/>
							</Box>
							<Button
								onClick={void copyToClipBoard}
								startIcon={<CopyAllIcon />}
							>
								copy
							</Button>
						</>
					) : valueIsUrl ? (
						<Link href={generatedValue}>{generatedValue}</Link>
					) : (
						<Typography>{generatedValue}</Typography>
					)}
				</Stack>
			</Grid>
		</Grid>
	);
};
