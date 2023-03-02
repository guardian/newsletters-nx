import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import type { Draft } from '@newsletters-nx/newsletters-data-client';
import { DeleteDraftButton } from './DeleteDraftButton';
import { Table } from './Table';

interface Props {
	drafts: Draft[];
}

export const DraftsTable = ({ drafts }: Props) => {
	const [data, setData] = useState(drafts);
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
			{
				Header: 'delete',
				Cell: ({ row: { original } }) => {
					const draft = original as Draft;

					return (
						<DeleteDraftButton
							draft={draft}
							hasBeenDeleted={false}
							setHasBeenDeleted={() => {
								setData(data.filter((item) => item.listId !== draft.listId));
							}}
						/>
					);
				},
			},
		],
		[data],
	);
	return <Table data={data} columns={columns} defaultSortId="name" />;
};
