import type { ColumnInstance } from 'react-table';

interface ColumnVisibilityProps<TData extends object> {
	column: ColumnInstance<TData>;
}

export const ColumnVisibility = <TData extends object>({
	column,
}: ColumnVisibilityProps<TData>) => {
	return (
		<div key={column.id}>
			<label>
				<input type="checkbox" {...column.getToggleHiddenProps()} />{' '}
				{column.Header as string}
			</label>
		</div>
	);
};
