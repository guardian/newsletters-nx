import { History, Undo } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { Fragment, useReducer } from "react";
import type { ApiResponse, Layout, NewsletterData } from "@newsletters-nx/newsletters-data-client";
import { fetchPostApiData } from "../../api-requests/fetch-api-data";
import { GroupControl } from "./GroupControl";
import { layoutReducer } from "./layout-reducer";
import { NewsletterPicker } from "./NewsletterPicker";

interface Props {
    layout: Layout;
    editionId: string;
    newsletters: NewsletterData[];
}


export const LayoutEditor = ({ layout: originalLayout, newsletters, editionId }: Props) => {

    const [state, dispatch] = useReducer(layoutReducer, {
        history: [originalLayout],
        feedback: undefined,
        updateInProgress: false,
        original: originalLayout,
    })

    const {
        feedback, updateInProgress, history, selectedNewsletter
    } = state
    const [localLayout] = history;

    const handleSubmitUpdate = async () => {
        if (updateInProgress) {
            return
        }
        dispatch({ type: 'set-pending' })
        const result = await fetchPostApiData<ApiResponse<Layout>>(
            `/api/layouts/${editionId}`,
            localLayout,
        );
        dispatch({ type: 'handle-server-response', success: !!result?.ok })
    };


    return (
        <Box>
            <Box display={'flex'} gap={2} minHeight={80} alignItems={'center'}>
                <Button variant="contained"
                    disabled={updateInProgress}
                    onClick={() => void handleSubmitUpdate()}
                >Publish update</Button>
                {updateInProgress && <CircularProgress />}
                {feedback === 'success' && <Alert severity="success">
                    <Typography>Layout updated</Typography>
                    <Typography>It will take some time for site to update</Typography>
                </Alert>}
                {feedback === 'failure' && <Alert severity="error">
                    <Typography>Failed to update</Typography>
                    <Typography>If the problem persists, please contact Central Production</Typography>
                </Alert>}
                <Box marginLeft={'auto'} display={'flex'} gap={1}>
                    <Button variant="outlined"
                        disabled={updateInProgress || state.history.length < 2}
                        startIcon={<Undo />}
                        onClick={() => dispatch({ type: 'undo' })}>
                        Undo
                    </Button>
                    <Button variant="outlined"
                        disabled={updateInProgress || state.history.length === 1}
                        startIcon={<History />}
                        onClick={() => dispatch({ type: 'reset' })}>
                        Reset
                    </Button>
                </Box>
            </Box>

            <Box display={'flex'} gap={1} paddingTop={2}>
                <NewsletterPicker
                    newsletters={newsletters}
                    selectedNewsletter={selectedNewsletter}
                    setSelectedNewsletter={(selectedNewsletter => dispatch({ type: 'select-newsletter', selectedNewsletter }))}
                    stackProps={{ flex: 1 }}
                />
                <Stack flex={3}>
                    {localLayout.groups.map((group, groupIndex) => (
                        <Fragment key={groupIndex}>
                            <Divider>
                                <Button variant="contained"
                                    onClick={() => dispatch({ type: 'add-group', index: groupIndex })}
                                >add group</Button>
                            </Divider>
                            <GroupControl
                                dispatch={dispatch}
                                groupIndex={groupIndex}
                                group={group}
                                selectedNewsletter={selectedNewsletter}
                                newsletters={newsletters}
                            />
                        </Fragment>
                    ))}
                    <Divider>
                        <Button variant="contained" onClick={() => dispatch({ type: 'add-group' })}>add group</Button>
                    </Divider>
                </Stack>
            </Box>
        </Box>
    )
}
