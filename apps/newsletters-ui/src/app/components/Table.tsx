import { Grid } from '@mui/material';
import type { Cell, Column } from 'react-table';
import { useFilters, useGlobalFilter, useSortBy, useTable } from 'react-table';
import { ContentWrapper } from '../ContentWrapper';
import { tableStyle } from '../styles';
import { ColumnData } from './ColumnData';
import { ColumnHeader } from './ColumnHeader';
import { ColumnVisibility } from './ColumnVisibility';
import { GlobalFilter } from './GlobalFilter';

interface TableProps<TData extends object> {
	data: TData[];
	columns: Array<Column<TData>>;
	defaultSortId?: string;
}

export const Table = <TData extends object>({
	data,
	columns,
	defaultSortId,
}: TableProps<TData>) => {
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
	} = useTable<TData>(
		{ columns, data, initialState },
		useFilters,
		useGlobalFilter,
		useSortBy,
	);

	const filterableColumns = allColumns.filter(
		(column) => column.canFilter && column.filter !== undefined,
	);

	return (
		<ContentWrapper>
			<Grid container spacing={2} rowSpacing={2} paddingY={2}>
				<Grid item xs={12}>
					<div>Hide/Show Columns</div>
				</Grid>
				<Grid item xs={12} display={'flex'} flexWrap={'wrap'}>
					{allColumns.map((column) => (
						<ColumnVisibility column={column} key={`visibility ${column.id}`} />
					))}
				</Grid>
				<Grid item xs={12} display={'flex'}>
					<GlobalFilter setGlobalFilter={setGlobalFilter} />
				</Grid>
				<Grid item xs={12}>
					<div>Apply Filters</div>
				</Grid>
				{filterableColumns.length && (
					<Grid item xs={12}>
						<Grid container spacing={2} rowSpacing={2}>
							{filterableColumns.map((column) => {
								console.log('Rendering filter for column:', column);

								return (
									<Grid item xs={12} sm={6} md={4} key={`filter ${column.id}`}>
										{column.render('Filter')}
									</Grid>
								);
							})}
						</Grid>
					</Grid>
				)}
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
								{row.cells.map((cell: Cell<TData>, index) => (
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
