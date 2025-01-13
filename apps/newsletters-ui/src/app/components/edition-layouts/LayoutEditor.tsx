import { Box, Button, Card, Divider, Stack } from "@mui/material";
import { Layout, NewsletterData } from "@newsletters-nx/newsletters-data-client";
import { Fragment, useState } from "react";
import { fetchPostApiData } from "../../api-requests/fetch-api-data";
import { addNewGroup, deleteGroup, deleteNewsletterFromGroup, insertNewsletterIntoGroup, updateLayoutGroup } from "../../lib/modify-layout";
import { StringInput } from "../SchemaForm/StringInput";
import { NewsletterCard } from "./NewsletterCard";

interface Props {
    layout: Layout;
    editionId: string;
    newsletters: NewsletterData[];
}


export const LayoutEditor = ({ layout: originalLayout, newsletters, editionId }: Props) => {
    const [localLayout, setLocalLayout] = useState(originalLayout);
    const [updateInProgress, setUpdateInProgress] = useState(false);
    const [lastUpdateFailed, setLastUpdateFailed] = useState(false);
    const [selectedNewsletter, setSelectedNewsletter] = useState<string | undefined>(undefined)

    const handleUpdate = async (updatedLayout: Layout) => {
        setUpdateInProgress(true)
        const result = await fetchPostApiData(
            `/api/layouts/${editionId}`,
            updatedLayout,
        );
        setUpdateInProgress(false)
        if (result) {
            setLastUpdateFailed(false)
        } else {
            setLastUpdateFailed(true)
        }
    };

    return (
        <Box>
            <Box display={'flex'} gap={2}>
                <Button variant="contained"
                    disabled={updateInProgress}
                    onClick={() => {
                        handleUpdate(localLayout)
                    }}>update</Button>
                {updateInProgress && <p>WAIT...</p>}
                {lastUpdateFailed && <p>FAILED!</p>}

            </Box>

            <Box display={'flex'} gap={1} paddingTop={2}>

                <Stack divider={<Divider sx={{ margin: 1 }} />}>
                    {localLayout.groups.map((group, groupIndex) => (
                        <Fragment key={groupIndex}>
                            <Button variant="outlined" onClick={() => {
                                setLocalLayout(addNewGroup(localLayout, groupIndex))
                            }}>add group</Button>
                            <Divider sx={{ margin: 1 }} />
                            <Box key={groupIndex} padding={2} component={Card}>
                                <Box display={'flex'} flexWrap={'wrap'} gap={2}>
                                    <Box flex={1}>
                                        <StringInput
                                            label="title"
                                            value={group.title}
                                            inputHandler={(title) => setLocalLayout(updateLayoutGroup(localLayout, groupIndex, { title }))}
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        <StringInput
                                            label="subtitle"
                                            value={group.subtitle ?? ''}
                                            inputHandler={(subtitle) => setLocalLayout(updateLayoutGroup(localLayout, groupIndex, { subtitle }))}
                                        />
                                    </Box>
                                    <Button variant="outlined" color="warning"
                                        onClick={() => {
                                            setLocalLayout(deleteGroup(localLayout, groupIndex))
                                        }}
                                    >delete group</Button>
                                </Box>
                                <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                                    {group.newsletters.map((newsletterId, newsletterIndex) => (
                                        <Box key={newsletterIndex} display={'flex'} justifyContent={'space-between'}>
                                            <Button
                                                disabled={!selectedNewsletter}
                                                onClick={() => {
                                                    if (selectedNewsletter) {
                                                        setLocalLayout(insertNewsletterIntoGroup(localLayout, groupIndex, newsletterIndex, selectedNewsletter))
                                                        setSelectedNewsletter(undefined)
                                                    }
                                                }}
                                            >insert</Button>
                                            <Box >
                                                <Button
                                                    onClick={() => setLocalLayout(deleteNewsletterFromGroup(localLayout, groupIndex, newsletterIndex))}
                                                >delete</Button>
                                                <NewsletterCard
                                                    size="small"
                                                    newsletterId={newsletterId}
                                                    index={newsletterIndex}
                                                    newsletter={newsletters.find(n => n.identityName === newsletterId)} />
                                            </Box>
                                        </Box>
                                    ))}

                                    <Button
                                        disabled={!selectedNewsletter}
                                        onClick={() => {
                                            if (selectedNewsletter) {
                                                setLocalLayout(insertNewsletterIntoGroup(localLayout, groupIndex, group.newsletters.length, selectedNewsletter))
                                                setSelectedNewsletter(undefined)
                                            }
                                        }}
                                    >insert</Button>
                                </Box>
                            </Box>
                        </Fragment>
                    ))}

                    <Button variant="outlined" onClick={() => {
                        setLocalLayout(addNewGroup(localLayout, localLayout.groups.length))
                    }}>add group</Button>
                </Stack>

                <Stack divider={<Divider />}>
                    {newsletters.map((newsletter) => (
                        <Box key={newsletter.identityName}>
                            <Button
                                variant={newsletter.identityName === selectedNewsletter ? 'contained' : 'outlined'}
                                onClick={() => setSelectedNewsletter(newsletter.identityName)}
                            >{newsletter.name}</Button>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Box>
    )
}