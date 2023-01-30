import { Option, Select } from '@guardian/source-react-components';
import type { FieldDef, FieldValue } from './util';

interface SchemaSelectProps {
	field: FieldDef;
	change: { (value: FieldValue, field: FieldDef): void };
	options: string[];
	validationWarning?: string;
}
export const SchemaSelect = ({
	field,
	change,
	options,
	validationWarning,
}: SchemaSelectProps) => {
	return (
		<Select
			label={field.key}
			optional={field.optional}
			value={typeof field.value === 'string' ? field.value : undefined}
			error={validationWarning}
			onChange={(event) => {
				// using empty string as the value for the default option
				// since '' is falsy, the vaue passed the change function will
				// be undefined.
				change(event.target.value || undefined, field);
			}}
		>
			<>
				{field.optional && (
					// picking the default option should result in the field being set to undefined
					// but if the option value is undefined, the target.value the change event will
					// use the text content of the option as a fall back.
					<Option key={-1} value={''}>
						{`select ${field.key}`}
					</Option>
				)}
				{options.map((option) => (
					<Option key={option} value={option}>
						{option}
					</Option>
				))}
			</>
		</Select>
	);
};
