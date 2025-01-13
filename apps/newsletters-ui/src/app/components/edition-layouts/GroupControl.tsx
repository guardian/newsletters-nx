
import { Box, Button, Card, IconButton } from "@mui/material";
import { Layout, LayoutGroup, NewsletterData } from "@newsletters-nx/newsletters-data-client";
import { deleteGroup, deleteNewsletterFromGroup, insertNewsletterIntoGroup, updateLayoutGroup } from "../../lib/modify-layout";
import { StringInput } from "../SchemaForm/StringInput";
import { NewsletterCard } from "./NewsletterCard";
import Add from "@mui/icons-material/Add";
import { Fragment } from "react";

interface Props {
    groupIndex: number,
    group: LayoutGroup,
    setLocalLayout: { (layout: Layout): void },
    localLayout: Layout,
    selectedNewsletter: string | undefined,
    setSelectedNewsletter: { (identityName: string | undefined): void },
    newsletters: NewsletterData[]
}



export const GroupControl = ({
    groupIndex, group, setLocalLayout, localLayout, selectedNewsletter, setSelectedNewsletter, newsletters
}: Props) => {

    const InsertButton = ({ insertIndex }: { insertIndex: number }) => {
        return <IconButton color="primary" size="large"
            aria-label="insert newsletter"
            disabled={!selectedNewsletter}
            onClick={() => {
                if (selectedNewsletter) {
                    setLocalLayout(insertNewsletterIntoGroup(localLayout, groupIndex, insertIndex, selectedNewsletter));
                    setSelectedNewsletter(undefined);
                }
            }}
        >
            <Add fontSize="large" />
        </IconButton>;
    }

    return <Box key={groupIndex} padding={2} component={Card} sx={{ marginY: 1, backgroundColor: "secondary.light" }}>
        <Box display={'flex'} flexWrap={'wrap'} gap={2}>
            <Box flex={1}>
                <StringInput
                    label="Group Title"
                    value={group.title}
                    inputHandler={(title) => setLocalLayout(updateLayoutGroup(localLayout, groupIndex, { title }))} />
            </Box>
            <Box flex={1}>
                <StringInput optional
                    label="subtitle"
                    value={group.subtitle ?? ''}
                    inputHandler={(subtitle) => setLocalLayout(updateLayoutGroup(localLayout, groupIndex, { subtitle }))} />
            </Box>
            <Button variant="contained" color="warning"
                onClick={() => {
                    setLocalLayout(deleteGroup(localLayout, groupIndex));
                }}
            >delete group</Button>
        </Box>
        <Box display={'flex'} flexWrap={'wrap'} gap={1} alignItems={'center'}>
            {group.newsletters.map((newsletterId, newsletterIndex) => (
                <Fragment key={newsletterIndex}>
                    <InsertButton insertIndex={newsletterIndex} />
                    <Box>
                        <Button
                            onClick={() => setLocalLayout(deleteNewsletterFromGroup(localLayout, groupIndex, newsletterIndex))}
                        >remove</Button>
                        <NewsletterCard
                            size="small"
                            newsletterId={newsletterId}
                            index={newsletterIndex}
                            newsletter={newsletters.find(n => n.identityName === newsletterId)} />
                    </Box>
                </Fragment>
            ))}
            <InsertButton insertIndex={group.newsletters.length} />
        </Box>
    </Box>;
}
