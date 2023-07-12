import { TextField } from '@mui/material';
import type { FormEventHandler } from 'react';
import type { FieldProps } from './util';
import { eventToString } from './util';

// TO DO - add allowTabAndCr prop, if we ever need
// to collect multiline/formatted text.

// Would involve extending the StringInputSettings type
// and the WizardStepLayout type so it can be configured
// from the layout and passed down from SchemaForm.

const tabAndCrPattern = /["\n"|"\t"]/g;

type Props = FieldProps & {
	value: string;
	inputHandler: { (value: string): void };
	inputType?: 'textInput' | 'textArea';
};

export const StringInput = (props: Props) => {
	const { inputType = 'textInput' } = props;

	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		const inputValue = eventToString(event);
		const processedValue = inputValue.replace(tabAndCrPattern, '');
		props.inputHandler(processedValue);
	};

	return (
		<TextField
			multiline={inputType === 'textArea'}
			minRows={2}
			fullWidth
			label={props.label}
			type={inputType}
			value={props.value}
			onInput={sendValue}
			helperText={props.error}
			error={!!props.error}
			required={!props.optional}
			disabled={props.readOnly}
		/>
	);
};
