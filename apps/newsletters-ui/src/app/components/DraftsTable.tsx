import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import type { Draft } from '@newsletters-nx/newsletters-data-client';
import { Table } from './Table';

interface Props {
	drafts: Draft[];
}

export const DraftsTable = ({ drafts }: Props) => {
	const data = drafts;
	const columns = useMemo<Column[]>(
		() => [
			{
				Header: 'Draft ID number',
				accessor: 'listId',
				Cell: ({ cell: { value } }) => (
					<Link to={`./${value as string}`}>{value}</Link>
				),
			},
			{
				Header: 'Newsletter Name',
				accessor: 'name',
			},
			{
				Header: 'Pillar',
				accessor: 'theme',
				sortType: 'basic',
			},
		],
		[],
	);
	return <Table data={data} columns={columns} defaultSortId="name" />;
};
