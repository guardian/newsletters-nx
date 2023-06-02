import type { ZodObject, ZodRawShape } from 'zod';
import { getValidationWarnings } from '@newsletters-nx/newsletters-data-client';
import type { PrimitiveRecord } from '@newsletters-nx/newsletters-data-client';
// eslint-disable-next-line import/no-cycle -- schemaForm renders recursively for SchemaRecordArrayInput
import { SchemaForm } from '.';

interface Props {
	record: PrimitiveRecord;
	recordSchema: ZodObject<ZodRawShape>;
	editRecord: { (record: PrimitiveRecord): void };
	maxOptionsForRadioButtons?: number;
}

export const RecordInput = ({
	record,
	recordSchema,
	editRecord,
	maxOptionsForRadioButtons,
}: Props) => {
	const warnings = getValidationWarnings(record, recordSchema);
	return (
		<SchemaForm
			schema={recordSchema}
			data={record}
			validationWarnings={warnings}
			changeValue={(value, field) => {
				const mod: PrimitiveRecord = {};
				switch (typeof value) {
					case 'string':
					case 'number':
					case 'boolean':
					case 'undefined':
						mod[field.key] = value;
						break;
				}
				return editRecord({ ...record, ...mod });
			}}
			maxOptionsForRadioButtons={maxOptionsForRadioButtons}
		/>
	);
};
