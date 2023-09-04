import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { renderYesNo } from '../util';

export type Cell<T> = { cell: { value: T; row: { original: NewsletterData } } };

export const MIGRATION_TIMESTAMP_VALUE = 946684800;
export const formatCellBoolean = ({ cell: { value } }: Cell<boolean>) => (
	<span>{renderYesNo(value)}</span>
);

export const formatCellDate = ({ cell: { value } }: Cell<number>) => {
	if (!value) return <span></span>;
	if (value === MIGRATION_TIMESTAMP_VALUE) return <span>Unknown</span>;
	const date = new Date(value);
	const isValid = !isNaN(date.valueOf());
	const output = isValid ? date.toDateString() : '[INVALID DATE]';
	return <span>{output}</span>;
};

const formatStatus = (status: string) => status.toLowerCase().replace('_', ' ');

export const formatStatusCell = ({
	cell: {
		value,
		row: { original },
	},
}: Cell<string>) => {
	const {
		brazeCampaignCreationsStatus,
		ophanCampaignCreationsStatus,
		signupPageCreationsStatus,
		tagCreationsStatus,
	} = original;

	const statuses = `Braze status: ${formatStatus(
		brazeCampaignCreationsStatus,
	)}, Ophan status: ${formatStatus(
		ophanCampaignCreationsStatus,
	)}, Signup page status: ${formatStatus(
		signupPageCreationsStatus,
	)}, Tag status: ${formatStatus(tagCreationsStatus)}`;
	if (!value) return <span></span>;

	const status = value.toLowerCase();
	const statusClass =
		status === 'pending' ? (
			<Tooltip title={statuses}>
				<span style={{ cursor: 'pointer', display: 'flex' }}>
					{status} <InfoIcon fontSize="small" style={{ paddingLeft: '4px' }} />
				</span>
			</Tooltip>
		) : (
			status
		);
	return <span>{statusClass}</span>;
};
