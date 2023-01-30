export type Cell<T> = { cell: { value: T } };

export const formatCellBoolean = ({ cell: { value } }: Cell<boolean>) => (
	<span>{value ? '✅ Yes' : '❌ No'}</span>
);
