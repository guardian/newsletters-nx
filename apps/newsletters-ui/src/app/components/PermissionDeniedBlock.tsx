import { Typography } from '@guardian/stand/Typography';
import { StandErrorBlock } from './errors/StandErrorBlock';

export interface PermissionDeniedBlockProps {
	title?: string;
	backText?: string;
}

export const PermissionDeniedBlock = ({
	title = 'You do not have permission for this area of the Newsletters tool',
	backText = 'Return to previous page',
}: PermissionDeniedBlockProps) => {
	const description = (
		<Typography element="p">
			Please contact{' '}
			<a href="mailto:central.production@guardian.co.uk">Central Production</a>{' '}
			if you need permission.
		</Typography>
	);

	return (
		<StandErrorBlock
			title={title}
			description={description}
			backText={backText}
		/>
	);
};
