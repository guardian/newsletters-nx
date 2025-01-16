import { RadioButtonChecked, RadioButtonUnchecked } from "@mui/icons-material"
import { Checkbox, Divider, List, ListItem, ListItemButton, ListItemText, Stack, StackProps, Typography } from "@mui/material"
import { useState } from "react"
import type { NewsletterData } from "@newsletters-nx/newsletters-data-client"
import { StringInput } from "../SchemaForm/StringInput"


interface Props {
    newsletters: NewsletterData[];
    selectedNewsletter?: string;
    setSelectedNewsletter: { (identityName?: string): void };
    stackProps?: StackProps
}

export const NewsletterPicker = ({ newsletters, selectedNewsletter, setSelectedNewsletter, stackProps }: Props) => {

    const [searchText, setsearchText] = useState('')

    const filteredNewsletters = searchText
        ? newsletters.filter(
            newsletter =>
                newsletter.identityName === selectedNewsletter ||
                newsletter.name.toLowerCase().includes(searchText.toLowerCase()) ||
                newsletter.identityName.toLowerCase().includes(searchText.toLowerCase())
        )
        : newsletters

    return <Stack {...stackProps} divider={<Divider />}>
        <Typography variant="h3" sx={{ marginTop: 0 }}>Pick newsletter to insert</Typography>
        <StringInput optional label="search" value={searchText} inputHandler={setsearchText} />

        <List disablePadding>

            {filteredNewsletters.map((newsletter) => (
                <ListItem key={newsletter.identityName} disableGutters disablePadding>

                    <ListItemButton disableGutters sx={{ paddingY: 0 }}
                        // variant={newsletter.identityName === selectedNewsletter ? 'contained' : 'outlined'}
                        onClick={() => setSelectedNewsletter(newsletter.identityName)}
                    >
                        <Checkbox
                            checkedIcon={<RadioButtonChecked />}
                            icon={<RadioButtonUnchecked />}
                            size="small"
                            // edge="start"
                            checked={newsletter.identityName === selectedNewsletter}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-labelledby': newsletter.name }}
                        />
                        <ListItemText
                            primary={newsletter.name}
                            secondary={newsletter.status !== 'live' && newsletter.status} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    </Stack>

}