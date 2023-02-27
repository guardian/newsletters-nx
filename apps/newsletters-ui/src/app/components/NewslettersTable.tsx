import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import type { LegacyNewsletter } from '@newsletters-nx/newsletters-data-client';
import { formatCellBoolean } from './Cell';
import { Table } from './Table';

interface Props {
	newsletters: LegacyNewsletter[];
}

export const NewslettersTable = ({ newsletters }: Props) => {
	const data = newsletters;
	const columns = useMemo<Column[]>(
		() => [
			{
				Header: 'LegacyNewsletter ID',
				accessor: 'identityName',
				Cell: ({ cell: { value } }) => (
					<Link to={`/newsletters/${value as string}`}>{value}</Link>
				),
			},
			{
				Header: 'LegacyNewsletter Name',
				accessor: 'name',
			},
			{
				Header: 'Paused',
				accessor: 'paused',
				sortType: 'basic',
				Cell: formatCellBoolean,
			},
		],
		[],
	);
	return <Table data={data} columns={columns} defaultSortId="identityName" />;
};
