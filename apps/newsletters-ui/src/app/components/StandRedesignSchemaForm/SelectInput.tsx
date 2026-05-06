import { Option, Select } from '@guardian/stand/select';
import type { FunctionComponent } from 'react';
import type { Key } from 'react-aria-components';
import type { StandardFormProps } from './SchemaField';
import type { FieldProps } from './util';

const EMPTY_STRING = '';

export const StandSelectInput: FunctionComponent<
	FieldProps &
		StandardFormProps & {
			value: string | undefined;
			options: string[];
		}
> = (props) => {
	const {
		value,
		description,
		optional,
		options,
		inputHandler,
		label = 'value',
	} = props;
	const handleChange = (value: Key | Key[] | null) => {
		console.log(value);
		if (value === EMPTY_STRING || value === null) {
			return inputHandler(undefined);
		}
		return inputHandler(value as string);
	};
	const valueAsString = value ?? EMPTY_STRING;

	return (
		<Select
			label={label}
			description={description}
			value={valueAsString}
			onChange={handleChange}
		>
			{optional && <Option value={{ EMPTY_STRING }}>[none]</Option>}
			{options.map((option) => (
				<Option value={{ option }}>{option}</Option>
			))}
		</Select>
	);
};
