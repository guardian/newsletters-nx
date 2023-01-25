import styled from '@emotion/styled';
import { Button } from '@guardian/source-react-components';
import { useNavigate } from 'react-router';

const ContainerStyle = styled.div`
	display: grid;
	grid-template-columns: auto auto auto;
	column-gap: 40px;
	row-gap: 25px;
	@media (max-width: 375px) {
		grid-template-columns: auto;
	}
`;

export function ButtonContainer() {
	const navigate = useNavigate();

	return (
		<ContainerStyle>
			<Button onClick={() => navigate('/newsletters/')}>
				View current newsletters
			</Button>
			<Button
				onClick={() =>
					alert('Create new newsletter has not yet been implemented')
				}
			>
				Create new newsletter
			</Button>
			<Button
				onClick={() => alert('Update newsletter has not yet been implemented')}
			>
				Update newsletter
			</Button>
			<Button
				onClick={() =>
					alert('Create email template has not yet been implemented')
				}
			>
				Create email template
			</Button>
			<Button
				onClick={() =>
					alert('Create single thrasher has not yet been implemented')
				}
			>
				Create single thrasher
			</Button>
			<Button
				onClick={() =>
					alert('Create multi thrasher has not yet been implemented')
				}
			>
				Create multi thrasher
			</Button>
			<Button
				onClick={() =>
					alert('Update email template has not yet been implemented')
				}
			>
				Update email template
			</Button>
			<Button
				onClick={() =>
					alert('Update single thrasher has not yet been implemented')
				}
			>
				Update single thrasher
			</Button>
			<Button
				onClick={() =>
					alert('Update multi thrasher has not yet been implemented')
				}
			>
				Update multi thrasher
			</Button>
		</ContainerStyle>
	);
}
