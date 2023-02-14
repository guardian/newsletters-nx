import type { FunctionComponent } from 'react';
import type { FieldProps} from './FieldWrapper';
import { FieldWrapper } from './FieldWrapper';


export const SelectInput: FunctionComponent<
	FieldProps & {
		value: string | undefined;
		optional?: boolean;
		inputHandler: { (value: string | undefined): void };
		options: string[];
	}
> = (props) => {
	const { value, optional, options, inputHandler, label = 'value' } = props;

	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		return inputHandler(event.target.value || undefined);
	};

	return (
		<FieldWrapper {...props}>
			<select onChange={handleChange} value={value}>
				{optional && (
					// picking the default option should result in the field being set to undefined
					// but if the option value is undefined, the target.value the change event will
					// use the text content of the option as a fall back.
					<option value={''}>{`select ${label}`}</option>
				)}
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</FieldWrapper>
	);
};
