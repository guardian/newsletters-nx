import type { ColumnInstance } from 'react-table';

interface ColumnHeaderProps<TData extends object> {
	column: ColumnInstance<TData>;
}

export const ColumnHeader = <TData extends object>({
	column,
}: ColumnHeaderProps<TData>) => {
	return (
		<th {...column.getHeaderProps(column.getSortByToggleProps())}>
			{column.render('Header')}
			<span>
				{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
			</span>
		</th>
	);
};
