import {
	Card,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@mui/material';
import { useState } from 'react';
import type {
	ApiResponse,
	Draft,
	DraftWithId,
} from '@newsletters-nx/newsletters-data-client';

interface Props {
	draft: Draft;
}

export const DraftDetails = ({ draft }: Props) => {
	const [hasBeenDeleted, setHasBeenDeleted] = useState(false);
	const [deleteErrorMessage, setDeleteErrorMessage] = useState<
		string | undefined
	>(undefined);

	const handleDeleteResponse = (payload: ApiResponse<DraftWithId>) => {
		console.table(payload);
		if (payload.ok) {
			setHasBeenDeleted(true);
		} else {
			setDeleteErrorMessage(payload.message ?? 'UNKNOWN DELETE ERROR');
		}
	};

	const sendDeleteRequest = async (listId: number) => {
		const response = await fetch(`/api/v1/drafts/delete/${listId}`, {
			method: 'DELETE',
		});

		try {
			const payload = (await response.json()) as ApiResponse<DraftWithId>;
			handleDeleteResponse(payload);
		} catch (err) {
			console.warn('ERROR');
			console.log(err);

			setDeleteErrorMessage('DELETE REQUEST FAILED');
		}
	};

	const handleDeleteButton = () => {
		const { listId } = draft;
		if (typeof listId !== 'number') {
			console.warn('no list id');
			return;
		}
		return sendDeleteRequest(listId);
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
					<button onClick={handleDeleteButton}>DELETE</button>
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
