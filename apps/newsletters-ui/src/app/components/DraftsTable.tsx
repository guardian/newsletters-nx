import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button } from '@mui/material';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import { calculateProgress } from '@newsletters-nx/newsletters-data-client';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getEditDraftWizardLinks } from '../get-draft-edit-wizard-links';
import { usePermissions } from '../hooks/user-hooks';
import { CircularProgressWithLabel } from './CircularProgressWithLabel';
import { DeleteDraftButton } from './DeleteDraftButton';
import { EditDraftDialog } from './EditDraftDialog';
import { ExternalLinkButton } from './ExternalLinkButton';
import { MultiSelectColumnFilter } from './MultiSelectColumnFilter';
import { NavigateButton } from './NavigateButton';
import { Table } from './Table';

interface Props {
	drafts: DraftNewsletterData[];
}
export const DraftsTable = ({ drafts }: Props) => {
	const [draftInDialog, setDraftInDialog] = useState<
		DraftNewsletterData | undefined
	>(undefined);

	type DraftRow = DraftNewsletterData & {
		wizardListId: DraftNewsletterData['listId'];
		progress: number;
	};

	const [data, setData] = useState<DraftRow[]>(
		drafts.map((draft) => ({
			...draft,
			wizardListId: draft['listId'],
			progress: calculateProgress(draft),
		})),
	);

	const {
		writeToDrafts: userCanWriteToDrafts,
		launchNewsletters: userCanLaunch,
	} = usePermissions() ?? {};

	const columns = useMemo<Array<Column<DraftRow>>>(() => {
		const infoColumns: Array<Column<DraftRow>> = [
			{
				Header: 'Draft ID number',
				accessor: 'listId',
				Cell: ({ cell: { value } }) =>
					value !== undefined ? <Link to={`./${value}`}>{value}</Link> : null,
			},
			{
				Header: 'Newsletter Name',
				accessor: 'name',
			},
			{
				Header: 'Category',
				accessor: 'category',
				Filter: MultiSelectColumnFilter,
				filter: 'includesValue',
			},
			{
				Header: 'Design',
				accessor: 'figmaDesignUrl',
				Cell: ({ cell: { value } }) =>
					value ? <ExternalLinkButton href={value} text="design" /> : null,
			},
			{
				Header: 'Pillar',
				accessor: 'theme',
				sortType: 'basic',
				Filter: MultiSelectColumnFilter,
				filter: 'includesValue',
			},
			{
				Header: 'Progress',
				accessor: (row) => row.progress,
				Cell: ({ cell: { value } }: { cell: { value: number } }) => (
					<CircularProgressWithLabel value={value} />
				),
			},
		];

		const editColumns: Array<Column<DraftRow>> = [
			{
				Header: 'Edit',
				Cell: ({ row: { original } }) => {
					const draft = original as DraftNewsletterData;
					const links = getEditDraftWizardLinks(draft);

					if (links.length === 1) {
						const [link] = links;
						return (
							<NavigateButton
								href={link?.href}
								startIcon={<SettingsIcon />}
								variant="outlined"
							>
								Edit
							</NavigateButton>
						);
					}

					return (
						<Button
							onClick={() => {
								setDraftInDialog(draft);
							}}
							startIcon={<SettingsIcon />}
							variant="outlined"
						>
							Edit
						</Button>
					);
				},
			},
			{
				Header: 'Delete',
				Cell: ({ row: { original } }) => {
					const draft = original as DraftNewsletterData;

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
		];

		const launchColumns: Array<Column<DraftRow>> = [
			{
				Header: 'Launch',
				Cell: ({ row: { original } }) => {
					const draft = original as DraftNewsletterData;

					if (!draft.listId) {
						return null;
					}
					return (
						<NavigateButton
							href={`/drafts/launch-newsletter/${draft.listId}`}
							variant="outlined"
							color="success"
							startIcon={<RocketLaunchIcon />}
						>
							launch
						</NavigateButton>
					);
				},
			},
		];

		return [
			...infoColumns,
			...(userCanWriteToDrafts ? editColumns : []),
			...(userCanLaunch ? launchColumns : []),
		];
	}, [data, userCanLaunch, userCanWriteToDrafts]);
	return (
		<>
			<Table data={data} columns={columns} defaultSortId="name" />
			<EditDraftDialog
				draft={draftInDialog}
				close={() => {
					setDraftInDialog(undefined);
				}}
			/>
		</>
	);
};
