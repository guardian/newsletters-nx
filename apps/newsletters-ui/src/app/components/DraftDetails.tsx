import { space } from '@guardian/source-foundations';
import {
	Card,
	CardContent,
	CardHeader,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getPalette } from '../util';
import { DeleteDraftButton } from './DeleteDraftButton';

interface Props {
	draft: DraftNewsletterData;
}

const propertyToString = (
	draft: DraftNewsletterData,
	key: keyof DraftNewsletterData,
) => {
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
				const stringification = JSON.stringify(value);
				return stringification;
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

	return (
		<Card sx={{ backgroundColor: palette[800], marginBottom: space[2] }}>
			<CardContent>
				<Typography sx={{ fontSize: 28, color: palette[100] }}>
					{draft.name ?? 'UNNAMED DRAFT'}
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
			<CardContent>
				<TableContainer
					component={Paper}
					sx={{
						width: '36rem',
						backgroundColor: hasBeenDeleted ? 'pink' : undefined,
					}}
				>
					<Table>
						{hasBeenDeleted && <caption>DELETED</caption>}
						<TableBody>
							{Object.entries(draft).map(([key, value]) => (
								<TableRow key={key}>
									<TableCell size="small" sx={{ fontWeight: 'bold' }}>
										{key}
									</TableCell>
									<TableCell>
										{propertyToString(draft, key as keyof DraftNewsletterData)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</CardContent>
		</Card>
	);
};
