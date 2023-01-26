import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { Table } from './Table';

interface Props {
	newsletters: Newsletter[];
}

type Cell<T> = { cell: { value: T } };

const formatCellBoolean = ({ cell: { value } }: Cell<boolean>) => (
	<span>{value ? '✅ Yes' : '❌ No'}</span>
);

export const NewslettersTable = ({ newsletters }: Props) => {
	const data = useMemo<object[]>(() => newsletters, [newsletters]);
	const columns = useMemo<Column[]>(
		() => [
			{
				Header: 'Newsletter ID',
				accessor: 'identityName',
				Cell: ({ cell: { value } }) => (
					<Link to={`/newsletters/${value as string}`}>{value}</Link>
				),
			},
			{
				Header: 'Newsletter Name',
				accessor: 'name',
			},
			{
				Header: 'Paused',
				accessor: 'paused',
				Cell: formatCellBoolean,
			},
		],
		[],
	);
	return <Table data={data} columns={columns} />;
};
