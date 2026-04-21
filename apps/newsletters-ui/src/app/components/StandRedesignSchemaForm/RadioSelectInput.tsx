import { Radio, RadioGroup } from '@guardian/stand/radio-group';
import type { FunctionComponent } from 'react';
import type { FieldProps } from './util';

const EMPTY_STRING = '';

export const StandRadioSelectInput: FunctionComponent<
	FieldProps & {
		value: string | undefined;
		optional?: boolean;
		inputHandler: { (value: string | undefined): void };
		options: string[];
	}
> = (props) => {
	const { value, options, optional, inputHandler, label = 'value' } = props;
	const valueAsString = value ?? EMPTY_STRING;

	return (
		<RadioGroup label={label} onChange={inputHandler} value={valueAsString}>
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
