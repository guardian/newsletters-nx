import { Box, Button, Divider, Stack } from "@mui/material";
import { Layout, LayoutGroup, NewsletterData } from "@newsletters-nx/newsletters-data-client";
import { useState } from "react";
import { fetchPostApiData } from "../../api-requests/fetch-api-data";
import { StringInput } from "../SchemaForm/StringInput";
import { NewsletterCard } from "./NewsletterCard";

interface Props {
    layout: Layout;
    editionId: string;
    newsletters: NewsletterData[];
}

const updateLayoutGroup = (layout: Layout, groupIndex: number, groupMod: Partial<LayoutGroup>): Layout => {
    const groupToUpdate = layout.groups[groupIndex];
    if (!groupToUpdate) {
        console.warn('invalid groupIndex', groupIndex, layout)
        return layout
    }
    return {
        ...layout,
        groups: [
            ...layout.groups.slice(0, groupIndex),
            { ...groupToUpdate, ...groupMod },
            ...layout.groups.slice(groupIndex + 1)
        ]
    }
}

const deleteNewsletterFromGroup = (layout: Layout, groupIndex: number, newsletterIndex: number): Layout => {
    const groupToUpdate = layout.groups[groupIndex];
    if (!groupToUpdate) {
        console.warn('invalid groupIndex', groupIndex, layout)
        return layout
    }
    return updateLayoutGroup(layout, groupIndex, {
        newsletters: [
            ...groupToUpdate.newsletters.slice(0, newsletterIndex),
            ...groupToUpdate.newsletters.slice(newsletterIndex + 1),
        ]
    })
}
const insertNewsletterIntoGroup = (layout: Layout, groupIndex: number, newsletterIndex: number, newsletterId: string): Layout => {
    const groupToUpdate = layout.groups[groupIndex];
    if (!groupToUpdate) {
        console.warn('invalid groupIndex', groupIndex, layout)
        return layout
    }
    return updateLayoutGroup(layout, groupIndex, {
        newsletters: [
            ...groupToUpdate.newsletters.slice(0, newsletterIndex),
            newsletterId,
            ...groupToUpdate.newsletters.slice(newsletterIndex),
        ]
    })
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

            <Box display={'flex'} >

                <Stack divider={<Divider sx={{ margin: 2 }} />}>
                    {localLayout.groups.map((group, groupIndex) => (
                        <Box key={groupIndex} padding={2} borderRight={1}>
                            <StringInput
                                label="title"
                                value={group.title}
                                inputHandler={(title) => setLocalLayout(updateLayoutGroup(localLayout, groupIndex, { title }))}
                            />
                            <StringInput
                                label="subtitle"
                                value={group.subtitle ?? ''}
                                inputHandler={(subtitle) => setLocalLayout(updateLayoutGroup(localLayout, groupIndex, { subtitle }))}
                            />
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
                    ))}
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