import { renderYesNo } from '../util';

export type Cell<T> = { cell: { value: T } };
export const MIGRATION_TIMESTAMP_VALUE = 946684800;
export const formatCellBoolean = ({ cell: { value } }: Cell<boolean>) => (
	<span>{renderYesNo(value)}</span>
);

export const formatCellDate = ({ cell: { value } }: Cell<number>) => {
	if (!value) return <span></span>;
	if (value === MIGRATION_TIMESTAMP_VALUE) return <span>Unknown</span>;
	const date = new Date(value);
	const isValid = !isNaN(date.valueOf());
	const output = isValid ? date.toDateString() : '[INVALID DATE]';
	return <span>{output}</span>;
};
