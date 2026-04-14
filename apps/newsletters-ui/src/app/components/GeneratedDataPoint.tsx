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
		<Grid container sx={{ justifyContent: 'space-between' }} spacing={1}>
			<Grid sx={{ flexGrow: 1, flexShrink: 0 }} size={3}>
				<Typography variant="caption">{valueGenerator.displayName}</Typography>
				<Tooltip title={valueGenerator.description} arrow>
					<Chip size="small" label="?" />
				</Tooltip>
			</Grid>
			<Grid sx={{ flexShrink: 1 }} size={9}>
				<Stack direction={'row'}>
					{includeCopyButton ? (
						<>
							<Box sx={{ flex: 1, display: 'flex' }}>
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
								onClick={() => void copyToClipBoard()}
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
