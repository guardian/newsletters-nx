import type { FunctionComponent } from 'react';
import type { ZodObject, ZodRawShape } from 'zod';
import { getEmptySchemaData } from '@newsletters-nx/newsletters-data-client';
import type { PrimitiveRecord } from '@newsletters-nx/newsletters-data-client';
import { isPrimiveRecord } from '../../util';
import { defaultFieldStyle } from './styling';
import type { FieldProps, FieldValue } from './util';

const RecordDisplay = ({
	record,
	recordSchema,
	deleteRecord,
}: {
	record: PrimitiveRecord;
	recordSchema: ZodObject<ZodRawShape>;
	deleteRecord: { (): void };
}) => {
	return (
		<>
			<b>{recordSchema.description}</b>
			<pre>{JSON.stringify(record, undefined, 2)}</pre>
			<button onClick={deleteRecord}>delete</button>
		</>
	);
};

export const SchemaRecordArrayInput: FunctionComponent<
	FieldProps & {
		value: PrimitiveRecord[];
		inputHandler: { (newValue: FieldValue): void };
		recordSchema: ZodObject<ZodRawShape>;
	}
> = (props) => {
	const { value, label, inputHandler, recordSchema } = props;

	const sendValue = (data: PrimitiveRecord[]) => {
		console.log('sending', data);
		inputHandler(data);
	};

	const addNew = () => {
		const newRecord = getEmptySchemaData(recordSchema);
		if (!isPrimiveRecord(newRecord)) {
			console.warn(newRecord);
			return;
		}
		sendValue([...value, newRecord]);
	};

	const deleteRecordIndex = (index: number) => {
		sendValue([...value.slice(0, index), ...value.slice(index + 1)]);
	};

	return (
		<div css={defaultFieldStyle}>
			<fieldset>
				<legend>
					{label}: [{value.length}]
				</legend>
				<ul>
					{value.map((propertyValue, index) => {
						return (
							<li key={index}>
								<RecordDisplay
									record={propertyValue}
									recordSchema={recordSchema}
									deleteRecord={() => {
										deleteRecordIndex(index);
									}}
								/>
							</li>
						);
					})}
				</ul>
				<button onClick={addNew}>new</button>
			</fieldset>
		</div>
	);
};
