import { NumberInput, OptionalNumberInput } from './formControls';
import type { FieldDef, FieldValue, NumberInputSettings } from './util';

interface Props {
	numberValue: number | undefined;
	field: FieldDef;
	change: { (value: FieldValue, field: FieldDef): void };
	numberInputSettings?: NumberInputSettings;
}
export const SchemaNumber = ({
	numberValue,
	field,
	change,
	numberInputSettings = {},
}: Props) => {
	return field.optional ? (
		<OptionalNumberInput
			label={field.key}
			{...numberInputSettings}
			value={numberValue}
			inputHandler={(value) => {
				change(value, field);
			}}
		/>
	) : (
		<NumberInput
			label={field.key}
			{...numberInputSettings}
			value={numberValue ?? 0}
			inputHandler={(value) => {
				change(value, field);
			}}
		/>
	);
};
