import type { Cell } from 'react-table';

interface ColumnDataProps<TData extends object> {
	cell: Cell<TData>;
}

export const ColumnData = <TData extends object>({
	cell,
}: ColumnDataProps<TData>) => {
	return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
};
