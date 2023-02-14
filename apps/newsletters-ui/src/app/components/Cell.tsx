import { renderYesNo } from '../util';

export type Cell<T> = { cell: { value: T } };

export const formatCellBoolean = ({ cell: { value } }: Cell<boolean>) => (
	<span>{renderYesNo(value)}</span>
);
