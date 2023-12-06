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
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';
import django from 'highlight.js/lib/languages/django';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
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
    language: string;
}


export const GeneratedCodeDataPoint = ({
                                           newsletter,
                                           valueGenerator,
                                           includeCopyButton,
                                            language,
                                       }: Props) => {
    const generatedValue = valueGenerator.generate(newsletter);

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
