import { Grid } from '@mui/material';
import type { Cell, Column } from 'react-table';
import { useGlobalFilter, useSortBy, useTable } from 'react-table';
import { ContentWrapper } from '../ContentWrapper';
import { tableStyle } from '../styles';
import { ColumnData } from './ColumnData';
import { ColumnHeader } from './ColumnHeader';
import { ColumnVisibility } from './ColumnVisibility';
import { GlobalFilter } from './GlobalFilter';

interface TableProps {
	data: object[];
	columns: Column[];
	defaultSortId?: string;
}

export const Table = ({ data, columns, defaultSortId }: TableProps) => {
	const initialState = defaultSortId
		? { sortBy: [{ id: defaultSortId, desc: false }] }
		: {};

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		allColumns,
		setGlobalFilter,
	} = useTable({ columns, data, initialState }, useGlobalFilter, useSortBy);

	return (
		<ContentWrapper>
			<div>Hide/Show Columns</div>
			<Grid container spacing={2} rowSpacing={2} paddingY={2}>
				<Grid item xs={12} display={'flex'}>
					{allColumns.map((column) => (
						<ColumnVisibility column={column} key={`visibility ${column.id}`} />
					))}
				</Grid>
				<Grid item xs={12} display={'flex'}>
					<GlobalFilter setGlobalFilter={setGlobalFilter} />
				</Grid>
			</Grid>
			<table {...getTableProps()} css={tableStyle}>
				<thead>
					{headerGroups.map((headerGroup) => (
						<tr {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map((column) => (
								<ColumnHeader column={column} key={`header ${column.id}`} />
							))}
						</tr>
					))}
				</thead>
				<tbody {...getTableBodyProps()}>
					{rows.map((row) => {
						prepareRow(row);
						return (
							<tr {...row.getRowProps()}>
								{row.cells.map((cell: Cell, index) => (
									<ColumnData cell={cell} key={`data ${cell.column.id}`} />
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</ContentWrapper>
	);
};
