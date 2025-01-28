import { Alert, Box, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { Fragment, useState } from "react";
import type { Layout, NewsletterData } from "@newsletters-nx/newsletters-data-client";
import { fetchPostApiData } from "../../api-requests/fetch-api-data";
import { addNewGroup } from "../../lib/modify-layout";
import { GroupControl } from "./GroupControl";
import { NewsletterPicker } from "./NewsletterPicker";

interface Props {
    layout: Layout;
    editionId: string;
    newsletters: NewsletterData[];
}

type FeedbackType = 'success' | 'failure'

export const LayoutEditor = ({ layout: originalLayout, newsletters, editionId }: Props) => {
    const [localLayout, setLocalLayout] = useState(originalLayout);
    const [updateInProgress, setUpdateInProgress] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackType | undefined>(undefined);
    const [selectedNewsletter, setSelectedNewsletter] = useState<string | undefined>(undefined)

    const handleSubmitUpdate = async (updatedLayout: Layout) => {
        if (updateInProgress) {
            return
        }
        setUpdateInProgress(true)
        const result = await fetchPostApiData(
            `/api/layouts/${editionId}`,
            updatedLayout,
        );
        setUpdateInProgress(false)
        setFeedback(result ? 'success' : 'failure')
    };

    const handleChange = (layout: Layout) => {
        if (updateInProgress) {
            return
        }
        setFeedback(undefined)
        setLocalLayout(layout)
    }

    return (
        <Box>
            <Box display={'flex'} gap={2} minHeight={80} alignItems={'center'}>
                <Button variant="contained"
                    disabled={updateInProgress}
                    onClick={() => {
                        void handleSubmitUpdate(localLayout)
                    }}>Publish update</Button>
                {updateInProgress && <CircularProgress />}
                {feedback === 'success' && <Alert severity="success">
                    <Typography>Layout updated</Typography>
                    <Typography>It will take some time for site to update</Typography>
                </Alert>}
                {feedback === 'failure' && <Alert severity="error">
                    <Typography>Failed to update</Typography>
                    <Typography>If the problem persists, please contact Central Production</Typography>
                </Alert>}
            </Box>

            <Box display={'flex'} gap={1} paddingTop={2}>
                <NewsletterPicker
                    newsletters={newsletters}
                    selectedNewsletter={selectedNewsletter}
                    setSelectedNewsletter={setSelectedNewsletter}
                    stackProps={{ flex: 1 }}
                />
                <Stack flex={3}>
                    {localLayout.groups.map((group, groupIndex) => (
                        <Fragment key={groupIndex}>
                            <Divider>
                                <Button variant="contained" onClick={() => {
                                    handleChange(addNewGroup(localLayout, groupIndex))
                                }}>add group</Button>
                            </Divider>
                            <GroupControl
                                groupIndex={groupIndex}
                                group={group}
                                setLocalLayout={handleChange}
                                localLayout={localLayout}
                                selectedNewsletter={selectedNewsletter}
                                setSelectedNewsletter={setSelectedNewsletter}
                                newsletters={newsletters}
                            />
                        </Fragment>
                    ))}
                    <Divider>
                        <Button variant="contained" onClick={() => {
                            handleChange(addNewGroup(localLayout, localLayout.groups.length))
                        }}>add group</Button>
                    </Divider>
                </Stack>
            </Box>
        </Box>
    )
}
