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
import { requestDraftDeletion } from '../lib/requestDraftDeletion';

interface Props {
	draft: Draft;
}

export const DraftDetails = ({ draft }: Props) => {
	const [hasBeenDeleted, setHasBeenDeleted] = useState(false);
	const [deleteErrorMessage, setDeleteErrorMessage] = useState<
		string | undefined
	>(undefined);

	const sendDeleteRequest = async () => {
		const { listId } = draft;
		if (typeof listId !== 'number') {
			setDeleteErrorMessage('NO LIST ID');
			return;
		}

		const result = await requestDraftDeletion(listId);
		if (result.ok) {
			setHasBeenDeleted(true);
		} else {
			setDeleteErrorMessage(result.message);
		}
	};


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

			{!hasBeenDeleted && (
				<div>
					<button onClick={sendDeleteRequest}>DELETE</button>
				</div>
			)}
			{!!deleteErrorMessage && (
				<div>
					<b>DELETED ERROR:</b>
					<span>{deleteErrorMessage}</span>
				</div>
			)}
		</>
	);
};
