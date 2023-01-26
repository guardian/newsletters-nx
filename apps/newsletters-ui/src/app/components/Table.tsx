import { useTable } from 'react-table';
import type { Cell, Column } from 'react-table';
import { Link } from 'react-router-dom';

interface Props {
	data: object[];
	columns: Column[];
}

export const Table = ({ data, columns }: Props) => {
	const tableInstance = useTable({ columns, data });
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
		tableInstance;
	return (
		<table {...getTableProps()}>
			<thead>
				{headerGroups.map((headerGroup) => (
					<tr {...headerGroup.getFooterGroupProps()}>
						{headerGroup.headers.map((column) => (
							<th {...column.getHeaderProps()}>{column.render('Header')}</th>
						))}
					</tr>
				))}
			</thead>
			<tbody {...getTableBodyProps()}>
				{rows.map((row) => {
					prepareRow(row);
					return (
						<tr {...row.getRowProps()}>
							{row.cells.map((cell: Cell, index) => {
								return (
									<td {...cell.getCellProps()}>
										{index === 0 ? (
											<Link to={`/newsletters/${cell.value as string}`}>
												{cell.render('Cell')}
											</Link>
										) : (
											cell.render('Cell')
										)}
									</td>
								);
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};
