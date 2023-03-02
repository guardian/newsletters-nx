import {
	Card,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@mui/material';
import type { Draft } from '@newsletters-nx/newsletters-data-client';

interface Props {
	draft: Draft;
}

export const DraftDetails = ({ draft }: Props) => {
	return (
		<TableContainer component={Card} sx={{ width: '36rem' }}>
			<Table>
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
	);
};
