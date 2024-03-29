import DeleteIcon from '@mui/icons-material/Delete';
import {
	Alert,
	Badge,
	Box,
	Button,
	Divider,
	Grid,
	Typography,
} from '@mui/material';
import { Fragment } from 'react';
import type { FunctionComponent } from 'react';
import type { ZodObject, ZodRawShape } from 'zod';
import { getEmptySchemaData } from '@newsletters-nx/newsletters-data-client';
import type { PrimitiveRecord } from '@newsletters-nx/newsletters-data-client';
import { isPrimitiveRecord } from '../../util';
// eslint-disable-next-line import/no-cycle -- schemaForm renders recursively for SchemaRecordArrayInput
import { RecordInput } from './RecordInput';
import type { FieldProps, FieldValue } from './util';

export const SchemaRecordArrayInput: FunctionComponent<
	FieldProps & {
		value: PrimitiveRecord[];
		inputHandler: { (newValue: FieldValue): void };
		recordSchema: ZodObject<ZodRawShape>;
		maxOptionsForRadioButtons?: number;
	}
> = (props) => {
	const {
		value,
		label,
		inputHandler,
		recordSchema,
		maxOptionsForRadioButtons,
	} = props;

	const addNew = () => {
		const newRecord = getEmptySchemaData(recordSchema, {
			unwrapOptionals: true,
			setEnumsToFirstValue: true,
		});
		if (!isPrimitiveRecord(newRecord)) {
			console.warn(newRecord);
			return;
		}
		inputHandler([...value, newRecord]);
	};

	const deleteRecordIndex = (index: number) => {
		inputHandler([...value.slice(0, index), ...value.slice(index + 1)]);
	};

	const editRecordIndex = (index: number, updatedRecord: PrimitiveRecord) => {
		inputHandler([
			...value.slice(0, index),
			updatedRecord,
			...value.slice(index + 1),
		]);
	};

	return (
		<Box padding={2} border={1} borderColor={''} borderRadius={1}>
			<Badge badgeContent={value.length} color="primary">
				<Typography sx={{ fontWeight: 700, fontSize: 12 }}>{label}</Typography>
			</Badge>

			<Grid container alignItems={'stretch'} rowSpacing={1} columnSpacing={2}>
				{value.length === 0 && (
					<Grid item xs={12}>
						<Alert severity="info">No Items</Alert>
					</Grid>
				)}
				{value.map((propertyValue, index) => {
					return (
						<Fragment key={index}>
							<Grid item xs={12} mt={2}>
								<Divider>
									<Typography variant="caption">
										{recordSchema.description ?? 'item'} #{index + 1}
									</Typography>
								</Divider>
							</Grid>
							<Grid item xs={8}>
								<RecordInput
									record={propertyValue}
									recordSchema={recordSchema}
									editRecord={(record) => {
										editRecordIndex(index, record);
									}}
									maxOptionsForRadioButtons={maxOptionsForRadioButtons}
								/>
							</Grid>
							<Grid
								item
								xs={4}
								sx={{
									display: 'flex',
									alignItems: 'center',
									marginBottom: '22px',
									flexDirection: 'row',
								}}
							>
								<Button
									size="small"
									color="error"
									variant="outlined"
									title={`delete item ${index + 1}`}
									onClick={() => {
										deleteRecordIndex(index);
									}}
									startIcon={<DeleteIcon />}
								>
									Delete
								</Button>
							</Grid>
						</Fragment>
					);
				})}
			</Grid>

			<Button
				fullWidth
				size="small"
				variant="outlined"
				color="success"
				title={`add new entry to ${label ?? ''} list`}
				onClick={addNew}
			>
				Add new item
			</Button>
		</Box>
	);
};
