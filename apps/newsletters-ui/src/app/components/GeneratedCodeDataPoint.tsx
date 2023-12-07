import CopyAllIcon from '@mui/icons-material/CopyAll';
import {
	Box,
	Button,
	Chip, FormControl,
	Grid, InputLabel, Select,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';
import django from 'highlight.js/lib/languages/django';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import type {
    NewsletterData,
    NewsletterValueGenerator,
} from '@newsletters-nx/newsletters-data-client';
import MenuItem from "@mui/material/MenuItem";
import {useState} from "react";


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

	const code = hljs.highlight(generatedValue, { language })
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
										<InputLabel id="demo-simple-select-label">DRR</InputLabel>
										<Select
											labelId="demo-simple-select-label"
											id="demo-simple-select"
											value={override}
											label="Age"
											onChange={(override) => setOverride(override.target.value as MerchandisingOverride)}
										>
											<MenuItem value={"default"}>Default</MenuItem>
											<MenuItem value={"AU"}>Australia</MenuItem>
											<MenuItem value={"Culture"}>Culture</MenuItem>
											<MenuItem value={"Features"}>Features</MenuItem>
											<MenuItem value={"Global"}>Global</MenuItem>
											<MenuItem value={"Sport"}>Sport</MenuItem>
											<MenuItem value={"US"}>US</MenuItem>
										</Select>
									</FormControl>
								</Box>
							</Stack>)
						}
							<Stack direction={'row'}>
									{
											<>
													<Box flex={1} display={'flex'} sx={{p: 1}}>
															<div dangerouslySetInnerHTML={{__html: code.value}}  />
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
