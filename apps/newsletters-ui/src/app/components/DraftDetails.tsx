import {
	Card,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@mui/material';
import { useState } from 'react';
import type { Draft } from '@newsletters-nx/newsletters-data-client';
import { DeleteDraftButton } from './DeleteDraftButton';

interface Props {
	draft: Draft;
}

export const DraftDetails = ({ draft }: Props) => {
	const [hasBeenDeleted, setHasBeenDeleted] = useState(false);

	return (
		<>
			<TableContainer
				component={Card}
				sx={{
					width: '24rem',
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
								<TableCell>{value}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<DeleteDraftButton
				draft={draft}
				hasBeenDeleted={hasBeenDeleted}
				setHasBeenDeleted={setHasBeenDeleted}
			/>
		</>
	);
};
