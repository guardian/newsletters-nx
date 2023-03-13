import { Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Wizard } from './Wizard';
import type { WizardProps } from './Wizard';

export const WizardContainer: React.FC<WizardProps> = ({
	wizardId,
	id,
}: WizardProps) => {
	const { listId } = useParams();
	return (
		<Container>
			<Wizard wizardId={wizardId} id={listId} />
		</Container>
	);
};
