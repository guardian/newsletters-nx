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
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';
import django from 'highlight.js/lib/languages/django';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('django', django);
hljs.registerLanguage('xml', xml);

interface Props {
	newsletter: NewsletterData;
	valueGenerator: NewsletterValueGenerator;
	includeCopyButton?: boolean;
	language: string;
}

export const GeneratedCodeDataPoint = ({
	newsletter,
	valueGenerator,
	includeCopyButton,
	language,
}: Props) => {
	const generatedValue = valueGenerator.generate(newsletter);

	const copyToClipBoard = async () =>
		await navigator.clipboard.writeText(generatedValue);

	const code = hljs.highlight(generatedValue, { language });

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
					{
						<>
							<Box sx={{ p: 1, flex: 1, display: 'flex' }}>
								<div dangerouslySetInnerHTML={{ __html: code.value }} />
							</Box>
							{includeCopyButton && (
								<Button
									onClick={() => void copyToClipBoard()}
									startIcon={<CopyAllIcon />}
								>
									copy
								</Button>
							)}
						</>
					}
				</Stack>
			</Grid>
		</Grid>
	);
};
