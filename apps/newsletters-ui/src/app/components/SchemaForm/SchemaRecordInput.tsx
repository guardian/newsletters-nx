import { FormGroup, Typography } from '@mui/material';
import type { FunctionComponent } from 'react';
import type { ZodObject, ZodRawShape } from 'zod';
import type { PrimitiveRecord } from '@newsletters-nx/newsletters-data-client';
// eslint-disable-next-line import/no-cycle -- schemaForm renders recursively for RecordInput
import { RecordInput } from './RecordInput';
import { defaultFieldStyle } from './styling';
import type { FieldProps, FieldValue } from './util';

export const SchemaRecordInput: FunctionComponent<
	FieldProps & {
		value: PrimitiveRecord;
		inputHandler: { (newValue: FieldValue): void };
		recordSchema: ZodObject<ZodRawShape>;
	}
> = (props) => {
	const { value, label, inputHandler, recordSchema, readOnly } = props;

	const sendValue = (data: PrimitiveRecord) => {
		if (readOnly) {
			return;
		}
		inputHandler(data);
	};

	return (
		<div css={defaultFieldStyle}>
			<FormGroup sx={{ flex: 1, paddingLeft: 3 }}>
				<Typography component={'legend'} variant="overline" marginBottom={1}>
					{label}
				</Typography>
				<RecordInput
					recordSchema={recordSchema}
					record={value}
					editRecord={sendValue}
				/>
			</FormGroup>
		</div>
	);
};
