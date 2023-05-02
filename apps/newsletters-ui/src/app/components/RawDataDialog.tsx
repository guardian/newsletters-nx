import {
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@mui/material';
import { useState } from 'react';
import type { ReactNode } from 'react';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';

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
				return (
					<pre style={{ fontSize: '75%', whiteSpace: 'pre-wrap' }}>
						{stringification}
					</pre>
				);
			} catch (err) {
				return '[non-serialisable object]';
			}
		case 'function':
			return '[function]';
	}
};

export const RawDataDialog = ({ newsletter }: Props) => {
	const [showRawData, setShowRawData] = useState(false);

	return (
		<>
			<Button
				onClick={() => {
					setShowRawData(true);
				}}
			>
				show raw data
			</Button>

			<Dialog
				maxWidth={'lg'}
				open={showRawData}
				onClose={() => {
					setShowRawData(false);
				}}
			>
				<DialogTitle>{newsletter.identityName}</DialogTitle>
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
				<DialogActions>
					<Button
						onClick={() => {
							setShowRawData(false);
						}}
					>
						close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
