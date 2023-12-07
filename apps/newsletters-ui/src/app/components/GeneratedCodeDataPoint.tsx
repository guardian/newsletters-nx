import CopyAllIcon from '@mui/icons-material/CopyAll';
import {
	Box,
	Button,
	Chip, FormControl, FormControlLabel, FormLabel,
	Grid, Radio, RadioGroup,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';
import django from 'highlight.js/lib/languages/django';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import {useState} from "react";
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


export const GeneratedCodeDataPoint = ({
																				 newsletter,
																				 valueGenerator,
																				 includeCopyButton,
																				 showOverride,
																				 language,
																			 }: Props) => {

	type MerchandisingOverride = 'default' | 'aus' | 'culture' | 'features' | 'global' | 'sport' | 'us';
	const [override, setOverride] = useState<MerchandisingOverride>('default' as MerchandisingOverride);
	const codeOverride = override === 'default' ? undefined : override;
	const generatedValue = valueGenerator.generate(newsletter, codeOverride);
	const copyToClipBoard = async () => await navigator.clipboard.writeText(generatedValue);

	const code = hljs.highlight(generatedValue, {language})
	return (
		<Grid container justifyContent={'space-between'} spacing={1}>
			<Grid item xs={3} flexGrow={1} flexShrink={0}>
				<Typography variant="caption">{valueGenerator.displayName}</Typography>
				<Tooltip title={valueGenerator.description} arrow>
					<Chip size="small" label="?"/>
				</Tooltip>
			</Grid>
			<Grid item xs={9} flexShrink={1}>
				{showOverride && (
					<Stack direction={'row'}>
						<Box flex={1} display={'flex'} sx={{p: 1}}>
							<FormControl fullWidth>
								<FormLabel id="demo-row-radio-buttons-group-label">DRR Slot Set</FormLabel>
								<RadioGroup
									row
									aria-labelledby="demo-row-radio-buttons-group-label"
									name="row-radio-buttons-group"
									value={override}
									onChange={(override) => setOverride(override.target.value as MerchandisingOverride)}
								>
									<FormControlLabel value="default" control={<Radio/>} label="Default"/>
									<FormControlLabel value="AUS" control={<Radio/>} label="Australia"/>
									<FormControlLabel value="Culture" control={<Radio/>} label="Culture"/>
									<FormControlLabel value="Features" control={<Radio/>} label="Features"/>
									<FormControlLabel value="Global" control={<Radio/>} label="Global"/>
									<FormControlLabel value="Sport" control={<Radio/>} label="Sport"/>
									<FormControlLabel value="US" control={<Radio/>} label="US"/>
								</RadioGroup>
							</FormControl>
						</Box>
					</Stack>)
				}
				<Stack direction={'row'}>
					{
						<>
							<Box flex={1} display={'flex'} sx={{p: 1}}>
								<div dangerouslySetInnerHTML={{__html: code.value}}/>
							</Box>
							{includeCopyButton && (
								<Button
									onClick={copyToClipBoard}
									startIcon={<CopyAllIcon/>}
								>
									copy
								</Button>)
							}
						</>
					}
				</Stack>
			</Grid>
		</Grid>
	);
};
