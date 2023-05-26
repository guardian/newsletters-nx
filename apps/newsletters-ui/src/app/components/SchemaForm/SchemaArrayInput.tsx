import type { FunctionComponent } from 'react';
import { ArrayInput } from './ArrayInput';
import { defaultFieldStyle } from './styling';
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
		<div css={defaultFieldStyle}>
			<ArrayInput
				data={value}
				label={label ?? ''}
				change={sendValue}
				validationWarning={props.error}
			/>
		</div>
	);
};
