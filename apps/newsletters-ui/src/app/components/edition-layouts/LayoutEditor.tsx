import { Box, Button, Divider, Stack } from "@mui/material";
import { Layout, NewsletterData } from "@newsletters-nx/newsletters-data-client";
import { Fragment, useState } from "react";
import { fetchPostApiData } from "../../api-requests/fetch-api-data";
import { addNewGroup } from "../../lib/modify-layout";
import { GroupControl } from "./GroupControl";
import { NewsletterPicker } from "./NewsletterPicker";

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
                    }}>Publish update</Button>
                {updateInProgress && <p>WAIT...</p>}
                {lastUpdateFailed && <p>FAILED!</p>}
            </Box>

            <Box display={'flex'} gap={1} paddingTop={2}>
                <NewsletterPicker
                    newsletters={newsletters}
                    selectedNewsletter={selectedNewsletter}
                    setSelectedNewsletter={setSelectedNewsletter}
                />
                <Stack>
                    {localLayout.groups.map((group, groupIndex) => (
                        <Fragment key={groupIndex}>
                            <Divider>
                                <Button variant="contained" onClick={() => {
                                    setLocalLayout(addNewGroup(localLayout, groupIndex))
                                }}>add group</Button>
                            </Divider>
                            <GroupControl
                                groupIndex={groupIndex}
                                group={group}
                                setLocalLayout={setLocalLayout}
                                localLayout={localLayout}
                                selectedNewsletter={selectedNewsletter}
                                setSelectedNewsletter={setSelectedNewsletter}
                                newsletters={newsletters}
                            />
                        </Fragment>
                    ))}
                    <Divider>
                        <Button variant="contained" onClick={() => {
                            setLocalLayout(addNewGroup(localLayout, localLayout.groups.length))
                        }}>add group</Button>
                    </Divider>
                </Stack>
            </Box>
        </Box>
    )
}
