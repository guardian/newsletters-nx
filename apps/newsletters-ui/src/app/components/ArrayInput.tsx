import {
	Alert,
	Badge,
	Box,
	Button,
	Grid,
	TextField,
	Typography,
} from '@mui/material';
import { Fragment } from 'react';

interface Props {
	data: string[];
	label: string;
	change: { (data: string[]): void };
	validationWarning?: string;
}
export const ArrayInput = ({
	data,
	change,
	validationWarning,
	label,
}: Props) => {
	const handleInput = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		index: number,
	) => {
		const dataCopy = [...data];
		dataCopy[index] = event.target.value;
		change(dataCopy);
	};

	const handleDelete = (index: number) => {
		const dataCopy = [...data];
		dataCopy.splice(index, 1);
		change(dataCopy);
	};

	const handleAdd = () => {
		const dataCopy = [...data, ''];
		change(dataCopy);
	};

	return (
		<Box paddingY={2} borderTop={1} borderBottom={1}>
			<Badge badgeContent={data.length} color="primary">
				<Typography sx={{ fontWeight: 700 }}>{label}</Typography>
			</Badge>
			{validationWarning && (
				<Alert severity="warning">{validationWarning}</Alert>
			)}

			<Grid container alignItems={'center'} rowSpacing={1} columnSpacing={2}>
				{data.length === 0 && (
					<Grid item xs={12}>
						<Alert severity="info">No Items</Alert>
					</Grid>
				)}

				{data.map((item, index) => (
					<Fragment key={index}>
						<Grid item xs={10}>
							<TextField
								variant="standard"
								fullWidth
								value={item}
								onChange={(event) => handleInput(event, index)}
							/>
						</Grid>
						<Grid item xs={2}>
							<Button
								size="small"
								color="error"
								variant="outlined"
								title={`delete entry "${item}"`}
								onClick={() => {
									handleDelete(index);
								}}
							>
								x
							</Button>
						</Grid>
					</Fragment>
				))}

				<Grid item xs={10}>
					<Button
						fullWidth
						size="small"
						variant="outlined"
						color="success"
						title={`add new entry to ${label} list`}
						onClick={() => {
							handleAdd();
						}}
					>
						Add new item
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
};
