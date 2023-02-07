import type { Cell } from 'react-table';

interface ColumnDataProps {
	cell: Cell;
}

export const ColumnData = ({ cell }: ColumnDataProps) => {
	return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
};
