import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button, Tooltip } from '@mui/material';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import {
	calculateProgress,
	noPermissionMessage,
} from '@newsletters-nx/newsletters-data-client';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getEditDraftWizardLinks } from '../get-draft-edit-wizard-links';
import { usePermissions } from '../hooks/user-hooks';
import { CircularProgressWithLabel } from './CircularProgressWithLabel';
import { DeleteDraftButton } from './DeleteDraftButton';
import { EditDraftDialog } from './EditDraftDialog';
import { ExternalLinkButton } from './ExternalLinkButton';
import { NavigateButton } from './NavigateButton';
import { Table } from './Table';

interface Props {
	drafts: DraftNewsletterData[];
}
export const DraftsTable = ({ drafts }: Props) => {
	const [draftInDialog, setDraftInDialog] = useState<
		DraftNewsletterData | undefined
	>(undefined);
	const [data, setData] = useState(
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
				Header: 'Category',
				accessor: 'category',
			},
			{
				Header: 'Design',
				accessor: 'figmaDesignUrl',
				Cell: ({ cell: { value } }) =>
					value ? (
						<ExternalLinkButton href={value as string} text="design" />
					) : null,
			},
			{
				Header: 'Pillar',
				accessor: 'theme',
				sortType: 'basic',
			},
			{
				Header: 'Progress',
				accessor: 'progress',
				Cell: ({ cell: { value } }) => (
					<CircularProgressWithLabel value={value as number} />
				),
			},
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
								disabled={!userCanWriteToDrafts}
								toolTip={
									!userCanWriteToDrafts
										? noPermissionMessage('writeToDrafts')
										: ''
								}
							>
								Edit
							</NavigateButton>
						);
					}

					return (
						<Tooltip
							title={
								!userCanWriteToDrafts
									? noPermissionMessage('writeToDrafts')
									: ''
							}
						>
							<span>
								<Button
									disabled={!userCanWriteToDrafts}
									onClick={() => {
										setDraftInDialog(draft);
									}}
									startIcon={<SettingsIcon />}
									variant="outlined"
								>
									Edit
								</Button>
							</span>
						</Tooltip>
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
			{
				Header: 'Launch',
				Cell: ({ row: { original } }) => {
					const draft = original as DraftNewsletterData;

					if (!draft.listId) {
						return null;
					}
					return (
						<NavigateButton
							href={`/newsletters/launch-newsletter/${draft.listId}`}
							variant="outlined"
							color="success"
							disabled={!userCanLaunch}
							toolTip={
								!userCanLaunch
									? noPermissionMessage('launchNewsletters')
									: undefined
							}
							startIcon={<RocketLaunchIcon />}
						>
							launch
						</NavigateButton>
					);
				},
			},
		],
		[data, userCanWriteToDrafts],
	);
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
