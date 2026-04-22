import { Radio, RadioGroup } from '@guardian/stand/radio-group';
import type { FunctionComponent } from 'react';
import type { StandardFormProps } from './SchemaField';
import type { FieldProps } from './util';

const EMPTY_STRING = '';

export const StandRadioSelectInput: FunctionComponent<
	FieldProps &
		StandardFormProps & {
			value: string | undefined;
			options: string[];
		}
> = (props) => {
	const {
		value,
		options,
		optional,
		inputHandler,
		label = 'value',
		description,
	} = props;
	const valueAsString = value ?? EMPTY_STRING;

	return (
		<RadioGroup
			label={label}
			onChange={inputHandler}
			value={valueAsString}
			description={description ?? ''}
		>
			{/* Haven't seen this used but have preserved this way of doing it */}
			{optional && <Radio value={EMPTY_STRING}>[none]</Radio>}
			{options.map((option) => (
				<Radio key={option} value={option}>
					{option}
				</Radio>
			))}
		</RadioGroup>
	);
};
