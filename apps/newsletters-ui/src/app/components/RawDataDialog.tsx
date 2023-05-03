import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	Paper,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@mui/material';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface Props {
	record: Record<string, unknown>;
	title?: string;
}

const propertyToNode = (
	record: Record<string, unknown>,
	key: string,
): ReactNode => {
	const value = record[key];

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
			return `[function: ${value.name}]`;
	}
};

export const RawDataDialog = ({ record, title = 'raw data' }: Props) => {
	const [showRawData, setShowRawData] = useState(false);
	const [showClipboardSuccess, setShowClipboardSuccess] = useState(false);
	const [showClipboardFail, setShowClipboardFail] = useState(false);

	const copyJson = async () => {
		try {
			const json = JSON.stringify(record);
			await navigator.clipboard.writeText(json);
			setShowClipboardSuccess(true);
		} catch (err) {
			console.log(err);
			setShowClipboardFail(true);
		}
	};

	return (
		<>
			<Button
				variant="contained"
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
				<DialogTitle>{title}</DialogTitle>
				<TableContainer component={Paper}>
					<Table size="small">
						<TableBody>
							{Object.keys(record).map((key) => (
								<TableRow key={key}>
									<TableCell size="small" sx={{ fontWeight: 'bold' }}>
										{key}
									</TableCell>
									<TableCell>{propertyToNode(record, key)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<DialogActions>
					<Button onClick={copyJson}>copy json</Button>
					<Button
						variant="contained"
						onClick={() => {
							setShowRawData(false);
						}}
					>
						close
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={showClipboardSuccess}
				autoHideDuration={4000}
				onClose={() => {
					setShowClipboardSuccess(false);
				}}
			>
				<Alert severity="success">Copied to clipboard</Alert>
			</Snackbar>
			<Snackbar
				open={showClipboardFail}
				autoHideDuration={4000}
				onClose={() => {
					setShowClipboardFail(false);
				}}
			>
				<Alert severity="error">Failed to copy to clipboard!</Alert>
			</Snackbar>
		</>
	);
};
