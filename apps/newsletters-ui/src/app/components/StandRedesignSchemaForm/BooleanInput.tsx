import { Checkbox } from '@guardian/stand/checkbox';
import type { FunctionComponent } from 'react';
import type { FieldProps } from './util';

export const StandBooleanInput: FunctionComponent<
	FieldProps & {
		value: boolean;
		inputHandler: { (value: boolean): void };
	}
> = (props) => {
	const { label, value, inputHandler, optional, readOnly } = props;

	return (
		<Checkbox
			isRequired={!optional}
			isSelected={value}
			onChange={inputHandler}
			isDisabled={readOnly}
		>
			{label}
		</Checkbox>
	);
};
