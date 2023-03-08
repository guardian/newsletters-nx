import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import type { Draft } from '@newsletters-nx/newsletters-data-client';
import { DeleteDraftButton } from './DeleteDraftButton';
import { Table } from './Table';

interface Props {
	drafts: Draft[];
}

export const DraftsTable = ({ drafts }: Props) => {
	const [data, setData] = useState(
		drafts.map((draft) => ({
			...draft,
			wizardListId: draft['listId'],
		})),
	);
	const navigate = useNavigate();
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
				Header: 'Wizard',
				accessor: 'wizardListId',
				Cell: ({ cell: { value } }) => (
					<button
						onClick={() => navigate(`/demo/newsletter-data/${value as string}`)}
					>
						Edit
					</button>
				),
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
								setData(
									data.filter((item) => item.wizardListId !== draft.listId),
								);
							}}
						/>
					);
				},
			},
		],
		[data, navigate],
	);
	return <Table data={data} columns={columns} defaultSortId="name" />;
};
