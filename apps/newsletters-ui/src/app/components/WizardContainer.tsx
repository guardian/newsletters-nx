import { Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Wizard } from './Wizard';

export const WizardContainer = () => {
	const { listId } = useParams();
	return (
		<Container>
			<Wizard id={listId} />
		</Container>
	);
};
