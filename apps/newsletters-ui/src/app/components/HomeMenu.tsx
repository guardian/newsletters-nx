import styled from '@emotion/styled';
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

export function HomeMenu() {
	const navigate = useNavigate();

	return (
		<ContainerStyle>
			<button onClick={() => navigate('/newsletters')}>
				View current newsletters
			</button>

			<button onClick={() => navigate('/drafts')}>
				View draft newsletters
			</button>

			<button onClick={() => navigate('/newsletters/create')}>
				Create new newsletter
			</button>

			<button onClick={() => navigate('/demo/newsletter-data')}>
				Demo create newsletter wizard
			</button>

			<button onClick={() => navigate('/demo/launch-newsletter')}>
				Demo launch newsletter wizard
			</button>

			<button onClick={() => navigate('/demo/forms')}>Demo form</button>

			<button disabled title="Not implemented yet">
				Update newsletter
			</button>
		</ContainerStyle>
	);
}
