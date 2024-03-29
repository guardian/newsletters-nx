import type { FunctionComponent } from 'react';
import { ArrayInput } from './ArrayInput';
import type { FieldProps, FieldValue } from './util';

export const SchemaArrayInput: FunctionComponent<
	FieldProps & {
		value: string[];
		inputHandler: { (newValue: FieldValue): void };
	}
> = (props) => {
	const { value, label, inputHandler } = props;
	const sendValue = (data: string[]) => {
		inputHandler(data);
	};

	return (
		<ArrayInput
			data={value}
			label={label ?? ''}
			change={sendValue}
			validationWarning={props.error}
		/>
	);
};
