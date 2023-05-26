import { Badge, Button, FormGroup, Stack, Typography } from '@mui/material';
import type { FunctionComponent } from 'react';
import type { ZodObject, ZodRawShape } from 'zod';
import {
	getEmptySchemaData,
	type PrimitiveRecord,
} from '@newsletters-nx/newsletters-data-client';
// eslint-disable-next-line import/no-cycle -- schemaForm renders recursively for RecordInput
import { RecordInput } from './RecordInput';
import { defaultFieldStyle } from './styling';
import type { FieldProps, FieldValue } from './util';
import { isPrimitiveRecord } from '../../util';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export const SchemaRecordInput: FunctionComponent<
	FieldProps & {
		value: PrimitiveRecord | undefined;
		inputHandler: { (newValue: FieldValue): void };
		recordSchema: ZodObject<ZodRawShape>;
	}
> = (props) => {
	const { value, label, inputHandler, recordSchema, readOnly, optional } =
		props;

	const sendValue = (data: PrimitiveRecord) => {
		if (readOnly) {
			return;
		}
		inputHandler(data);
	};

	const sendEmpty = () => {
		const blankData = getEmptySchemaData(recordSchema);
		if (!isPrimitiveRecord(blankData)) {
			console.error(
				`blank data produced for ${label} schema is not a supported record`,
				blankData,
			);
			return;
		}
		inputHandler(blankData);
	};

	return (
		<div css={defaultFieldStyle}>
			<FormGroup sx={{ flex: 1, paddingLeft: 3 }}>
				<Badge badgeContent={!value ? 'unset' : undefined} color="primary">
					<Stack
						direction={'row'}
						justifyContent={'space-between'}
						alignItems={'center'}
						flex={1}
					>
						<Typography
							component={'legend'}
							variant="subtitle2"
							marginBottom={1}
						>
							{label}
						</Typography>
						{optional && <Typography variant="overline">(optional)</Typography>}
					</Stack>
				</Badge>

				{value && (
					<>
						<RecordInput
							recordSchema={recordSchema}
							record={value}
							editRecord={sendValue}
						/>
						{optional && (
							<Button
								variant="outlined"
								color="warning"
								endIcon={<DeleteIcon />}
								onClick={() => {
									inputHandler(undefined);
								}}
							>
								Remove Value
							</Button>
						)}
					</>
				)}

				{!value && (
					<>
						<Button
							variant="outlined"
							onClick={sendEmpty}
							endIcon={<AddIcon />}
						>
							Define Value
						</Button>
					</>
				)}
			</FormGroup>
		</div>
	);
};
