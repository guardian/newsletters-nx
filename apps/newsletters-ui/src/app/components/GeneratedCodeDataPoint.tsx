import CopyAllIcon from '@mui/icons-material/CopyAll';
import {
	Box,
	Button,
	Chip,
	FormControl,
	FormControlLabel,
	FormLabel,
	Grid,
	Radio,
	RadioGroup,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';
import django from 'highlight.js/lib/languages/django';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import { useState } from 'react';
import type {
	NewsletterData,
	NewsletterValueGenerator,
} from '@newsletters-nx/newsletters-data-client';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('django', django);
hljs.registerLanguage('xml', xml);

interface Props {
	newsletter: NewsletterData;
	valueGenerator: NewsletterValueGenerator;
	includeCopyButton?: boolean;
	showOverride?: boolean;
	language: string;
}

export type MerchandisingOverride = 'default' | 'AUS' | 'Global' | 'US';

export const GeneratedCodeDataPoint = ({
	newsletter,
	valueGenerator,
	includeCopyButton,
	showOverride,
	language,
}: Props) => {
	const [override, setOverride] = useState<MerchandisingOverride>(
		'default' as MerchandisingOverride,
	);

	const overrideMapping: Record<string, string> = {
		Global: 'Newsletters',
	};

	const getOverride = (override: string): string =>
		overrideMapping[override] ?? override;

	const codeOverride =
		getOverride(override) === 'default' ? undefined : getOverride(override);

	const generatedValue = valueGenerator.generate(newsletter, codeOverride);

	const valueKeyMapping = {
		AUS: 'Australia',
		Global: 'Global',
		US: 'US',
		default: 'Default',
	};
	const copyToClipBoard = async () =>
		await navigator.clipboard.writeText(generatedValue);

	const code = hljs.highlight(generatedValue, { language });

	return (
		<Grid container justifyContent={'space-between'} spacing={1}>
			<Grid item xs={3} flexGrow={1} flexShrink={0}>
				<Typography variant="caption">{valueGenerator.displayName}</Typography>
				<Tooltip title={valueGenerator.description} arrow>
					<Chip size="small" label="?" />
				</Tooltip>
			</Grid>
			<Grid item xs={9} flexShrink={1}>
				{showOverride && (
					<Stack direction={'row'}>
						<Box flex={1} display={'flex'} sx={{ p: 1 }}>
							<FormControl fullWidth>
								<FormLabel id="drr-override-group-label">
									DRR Slot Set
								</FormLabel>
								<RadioGroup
									row
									aria-labelledby="drr-override-group-label"
									name="drr-row-radio-buttons-group"
									value={override}
									onChange={(override) =>
										setOverride(override.target.value as MerchandisingOverride)
									}
								>
									{['default', 'AUS', 'US', 'Global'].map((item) => (
										<FormControlLabel
											key={item}
											value={item}
											control={<Radio />}
											label={
												valueKeyMapping[item as keyof typeof valueKeyMapping]
											}
										/>
									))}
								</RadioGroup>
							</FormControl>
						</Box>
					</Stack>
				)}
				<Stack direction={'row'}>
					{
						<>
							<Box flex={1} display={'flex'} sx={{ p: 1 }}>
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
