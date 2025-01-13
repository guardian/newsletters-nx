import { Typography } from "@mui/material";
import { editionIds } from "@newsletters-nx/newsletters-data-client";
import { ContentWrapper } from "../../ContentWrapper";

interface Props {
    editionId?: string;
}

const getMessage = (editionId?: string) => {
    if (!editionId) {
        return "edition id not provided"
    }
    const editionIdIsValid =
        (editionId && (editionIds as string[]).includes(editionId)) || false;
    return editionIdIsValid ? `no layout set for "${editionId}"` : `no such edition "${editionId}"`;
}

export const MissingLayoutContent = ({ editionId }: Props) => {
    const message = getMessage(editionId);
    return <ContentWrapper>
        <Typography variant="h2">{message}</Typography>
    </ContentWrapper >
}