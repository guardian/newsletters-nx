import { renderYesNo } from '../util';

export type Cell<T> = { cell: { value: T } };

export const formatCellBoolean = ({ cell: { value } }: Cell<boolean>) => (
	<span>{renderYesNo(value)}</span>
);

export const formatCellDate = ({ cell: { value } }: Cell<string>) => {
	if (!value) return <span></span>;
	const date = new Date(value);
	const isValid = !isNaN(date.valueOf());
	const output = isValid ? date.toDateString() : '[INVALID DATE]';
	return <span>{output}</span>;
};
