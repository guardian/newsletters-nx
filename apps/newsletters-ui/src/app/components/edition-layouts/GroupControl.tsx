
import Add from "@mui/icons-material/Add";
import { Box, Button, Card, IconButton } from "@mui/material";
import type { Dispatch } from "react";
import { Fragment } from "react";
import type { Layout, LayoutGroup, NewsletterData } from "@newsletters-nx/newsletters-data-client";
import { deleteGroup, deleteNewsletterFromGroup, insertNewsletterIntoGroup, updateLayoutGroup } from "../../lib/modify-layout";
import { StringInput } from "../SchemaForm/StringInput";
import type { LayoutAction } from "./layout-reducer";
import { NewsletterCard } from "./NewsletterCard";

interface Props {
    dispatch: Dispatch<LayoutAction>;
    groupIndex: number;
    group: LayoutGroup;
    localLayout: Layout;
    selectedNewsletter: string | undefined;
    newsletters: NewsletterData[];
}



export const GroupControl = ({
    dispatch,
    groupIndex, group, localLayout, selectedNewsletter, newsletters
}: Props) => {

    const InsertButton = ({ insertIndex }: { insertIndex: number }) => {
        return <IconButton color="primary" size="large"
            aria-label="insert newsletter"
            disabled={!selectedNewsletter}
            onClick={() => {
                if (selectedNewsletter) {
                    dispatch({ type: 'local-update', layout: insertNewsletterIntoGroup(localLayout, groupIndex, insertIndex, selectedNewsletter) })
                    dispatch({ type: 'select-newsletter' })
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
                    inputHandler={(title) => dispatch(
                        { type: 'local-update', layout: updateLayoutGroup(localLayout, groupIndex, { title }) }
                    )} />
            </Box>
            <Box flex={1}>
                <StringInput optional
                    label="subtitle"
                    value={group.subtitle ?? ''}
                    inputHandler={(subtitle) => dispatch(
                        { type: 'local-update', layout: updateLayoutGroup(localLayout, groupIndex, { subtitle }) }
                    )} />
            </Box>
            <Button variant="contained" color="warning"
                onClick={() => dispatch(
                    { type: 'local-update', layout: deleteGroup(localLayout, groupIndex) }
                )}
            >delete group</Button>
        </Box>
        <Box display={'flex'} flexWrap={'wrap'} gap={1} alignItems={'center'}>
            {group.newsletters.map((newsletterId, newsletterIndex) => (
                <Fragment key={newsletterIndex}>
                    <InsertButton insertIndex={newsletterIndex} />
                    <Box>
                        <Button
                            onClick={() => dispatch(
                                { type: 'local-update', layout: deleteNewsletterFromGroup(localLayout, groupIndex, newsletterIndex) }
                            )}
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
