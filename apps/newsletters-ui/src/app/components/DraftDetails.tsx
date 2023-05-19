import { space } from '@guardian/source-foundations';
import {
	ButtonGroup,
	Card,
	CardContent,
	Container,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { getDraftNotReadyIssues } from '@newsletters-nx/newsletters-data-client';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getPalette } from '../util';
import { DeleteDraftButton } from './DeleteDraftButton';
import { EditDraftNavigateButtons } from './EditDraftNavigateButtons';
import { NavigateButton } from './NavigateButton';
import { ZodIssuesReport } from './ZodIssuesReport';

interface Props {
	draft: DraftNewsletterData;
}

const propertyToNode = (
	draft: DraftNewsletterData,
	key: keyof DraftNewsletterData,
): ReactNode => {
	const value = draft[key];

	switch (typeof value) {
		case 'string':
		case 'number':
		case 'bigint':
		case 'boolean':
		case 'symbol':
			return value.toString();
		case 'undefined':
			return '[UNDEFINED]';
		case 'object':
			try {
				const stringification = JSON.stringify(value, undefined, 2);
				return <pre>{stringification}</pre>;
			} catch (err) {
				return '[non-serialisable object]';
			}
		case 'function':
			return '[function]';
	}
};

export const DraftDetails = ({ draft }: Props) => {
	const [hasBeenDeleted, setHasBeenDeleted] = useState(false);

	const palette = getPalette(draft.theme ?? '');
	const issues = getDraftNotReadyIssues(draft);
	const readyToLaunch = issues.length === 0;

	return (
		<Container maxWidth="lg">
			<Card
				sx={{
					backgroundColor: palette[800],
					marginBottom: space[2],
					marginTop: space[1],
				}}
			>
				<CardContent>
					<Typography variant="h2">{draft.name ?? 'UNNAMED DRAFT'}</Typography>
					<Typography sx={{ fontSize: 16 }}>
						category: {draft.category}
					</Typography>
					<Typography sx={{ fontSize: 16 }}>id: {draft.listId}</Typography>
					<Typography sx={{ fontSize: 16 }}>
						created: {draft.creationTimeStamp}
					</Typography>
				</CardContent>

				<CardContent>
					<DeleteDraftButton
						draft={draft}
						hasBeenDeleted={hasBeenDeleted}
						setHasBeenDeleted={setHasBeenDeleted}
						margin={1}
					/>
				</CardContent>

				{draft.listId && (
					<CardContent>
						<ButtonGroup>
							<NavigateButton
								href={`..`}
								startIcon={<span>←</span>}
								color="secondary"
							>
								back to list
							</NavigateButton>
							<EditDraftNavigateButtons draft={draft} />

							{readyToLaunch && (
								<NavigateButton
									href={`/newsletters/launch-newsletter/${draft.listId}`}
									endIcon={
										<span role="img" aria-label="rocket">
											🚀
										</span>
									}
									color="success"
								>
									Launch
								</NavigateButton>
							)}
						</ButtonGroup>
					</CardContent>
				)}

				{issues.length > 0 && !hasBeenDeleted && (
					<CardContent>
						<ZodIssuesReport
							issues={issues}
							caption={'Missing data needed before launch'}
						/>
					</CardContent>
				)}

				<CardContent>
					<TableContainer
						component={Paper}
						sx={{
							backgroundColor: hasBeenDeleted ? 'pink' : undefined,
						}}
					>
						<Table size="small">
							<caption style={{ captionSide: 'top' }}>
								{hasBeenDeleted ? 'DELETED' : 'DATA'}
							</caption>

							<TableBody>
								{Object.keys(draft).map((key) => (
									<TableRow key={key}>
										<TableCell size="small" sx={{ fontWeight: 'bold' }}>
											{key}
										</TableCell>
										<TableCell>
											{propertyToNode(draft, key as keyof DraftNewsletterData)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</CardContent>
			</Card>
		</Container>
	);
};
