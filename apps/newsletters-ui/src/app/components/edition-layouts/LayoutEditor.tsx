import { History, Redo, Undo } from "@mui/icons-material";
import { Alert, Badge, Box, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { Fragment, useReducer } from "react";
import type { Layout, NewsletterData } from "@newsletters-nx/newsletters-data-client";
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
        redoStack: [],
    })

    const {
        feedback, updateInProgress, history, selectedNewsletter, redoStack
    } = state
    const [currentLayout] = history;
    const hasHistory = history.length > 1;
    const canRedo = redoStack.length > 0;

    const handleSubmitUpdate = async () => {
        if (updateInProgress) {
            return
        }
        dispatch({ type: 'set-pending' })
        const result = await fetchPostApiData<Layout>(
            `/api/layouts/${editionId}`,
            currentLayout,
        );
        dispatch({ type: 'handle-server-response', success: !!result })
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
                    <Badge badgeContent={hasHistory ? history.length - 1 : undefined} color="secondary">
                        <Button variant="outlined"
                            disabled={updateInProgress || !hasHistory}
                            startIcon={<Undo />}
                            onClick={() => dispatch({ type: 'undo' })}>
                            Undo
                        </Button>
                    </Badge>
                    <Badge badgeContent={canRedo ? redoStack.length : undefined} color="secondary">
                        <Button variant="outlined"
                            disabled={updateInProgress || !canRedo}
                            startIcon={<Redo />}
                            onClick={() => dispatch({ type: 'redo' })}
                        >
                            Redo
                        </Button>
                    </Badge>
                    <Button variant="outlined"
                        disabled={updateInProgress || !hasHistory}
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
                    {currentLayout.groups.map((group, groupIndex) => (
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
