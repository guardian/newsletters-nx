import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import type {
	DraftNewsletterData,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';

interface Props {
	newsletter: NewsletterData;
}

const propertyToNode = (
	newsletter: NewsletterData,
	key: keyof NewsletterData,
): ReactNode => {
	const value = newsletter[key];

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

export const NewsletterDataDetails = ({ newsletter }: Props) => {
	return (
		<Box>
			<Typography variant="h2">{newsletter.identityName}</Typography>

			<TableContainer component={Paper}>
				<Table size="small">
					<TableBody>
						{Object.keys(newsletter).map((key) => (
							<TableRow key={key}>
								<TableCell size="small" sx={{ fontWeight: 'bold' }}>
									{key}
								</TableCell>
								<TableCell>
									{propertyToNode(newsletter, key as keyof NewsletterData)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};
