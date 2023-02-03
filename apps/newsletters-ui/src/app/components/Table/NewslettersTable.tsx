import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { formatCellBoolean } from './cellValueTransformers';
import { Table } from './Table';

interface Props {
	newsletters: Newsletter[];
}

export const NewslettersTable = ({ newsletters }: Props) => {
	const data = newsletters;
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
				sortType: 'basic',
				Cell: formatCellBoolean,
			},
		],
		[],
	);
	return <Table data={data} columns={columns} defaultSortId="identityName" />;
};
