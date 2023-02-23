import { Checkbox, css, FormControlLabel, FormGroup } from '@mui/material';
import type { FormEventHandler, FunctionComponent } from 'react';
import type { FieldProps } from './util';
import { eventToBoolean } from './util';

export const BooleanInput: FunctionComponent<
	FieldProps & {
		value: boolean;
		inputHandler: { (value: boolean): void };
	}
> = (props) => {
	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		props.inputHandler(eventToBoolean(event));
	};

	return (
		<div
			css={css`
				margin-bottom: 1rem;
				max-width: 24rem;
			`}
		>
			<FormGroup>
				<FormControlLabel
					control={
						<Checkbox
							checked={props.value}
							onChange={sendValue}
							required={!props.optional}
							disabled={props.readOnly}
						/>
					}
					label={props.label}
				/>
			</FormGroup>
		</div>
	);
};
