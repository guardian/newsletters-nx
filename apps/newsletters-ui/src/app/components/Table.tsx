import { Grid } from '@mui/material';
import { useEffect } from 'react';
import type {
	Cell,
	Column,
	IdType,
	SortingRule,
	TableState,
} from 'react-table';
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
	initialState?: Partial<TableState<TData>>;
	onStateChange?: (state: {
		sortBy: Array<SortingRule<TData>>;
		filters: Array<{ id: string; value: string[] }>;
		hiddenColumns: Array<IdType<TData>>;
	}) => void;
}

export const Table = <TData extends object>({
	data,
	columns,
	initialState,
	onStateChange,
}: TableProps<TData>) => {
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		allColumns,
		setGlobalFilter,
		state: { filters, sortBy, hiddenColumns = [] },
	} = useTable<TData>(
		{ columns, data, initialState },
		useFilters,
		useGlobalFilter,
		useSortBy,
	);

	// Notify parent of state changes
	useEffect(() => {
		if (onStateChange) {
			onStateChange({
				sortBy,
				filters: filters as Array<{ id: string; value: string[] }>,
				hiddenColumns,
			});
		}
	}, [sortBy, filters, hiddenColumns, onStateChange]);

	const filterableColumns = allColumns.filter(
		(column) => column.canFilter && column.filter !== undefined,
	);

	return (
		<ContentWrapper>
			<Grid container spacing={2} rowSpacing={2} sx={{ paddingY: 2 }}>
				<Grid size={12}>
					<div>Hide/Show Columns</div>
				</Grid>
				<Grid sx={{ display: 'flex', flexWrap: 'wrap' }} size={12}>
					{allColumns.map((column) => (
						<ColumnVisibility column={column} key={`visibility ${column.id}`} />
					))}
				</Grid>
				<Grid sx={{ display: 'flex' }} size={12}>
					<GlobalFilter setGlobalFilter={setGlobalFilter} />
				</Grid>
				{filterableColumns.length && (
					<>
						<Grid size={12}>
							<div>Apply Filters</div>
						</Grid>
						<Grid size={12}>
							<Grid container spacing={2} rowSpacing={2}>
								{filterableColumns.map((column) => (
									<Grid
										key={`filter ${column.id}`}
										size={{
											xs: 12,
											sm: 6,
											md: 4,
										}}
									>
										{column.render('Filter')}
									</Grid>
								))}
							</Grid>
						</Grid>
					</>
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
								{row.cells.map((cell: Cell<TData>) => (
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
