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

const propertyToString = (draft: Draft, key: keyof Draft) => {
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

	return (
		<>
			<TableContainer
				component={Card}
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
									{propertyToString(draft, key as keyof Draft)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<DeleteDraftButton
				draft={draft}
				hasBeenDeleted={hasBeenDeleted}
				setHasBeenDeleted={setHasBeenDeleted}
				margin={4}
			/>
		</>
	);
};
