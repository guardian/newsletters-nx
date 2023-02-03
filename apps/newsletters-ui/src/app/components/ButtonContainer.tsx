import styled from '@emotion/styled';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

const ContainerStyle = styled.div`
	display: grid;
	grid-template-columns: auto auto auto;
	column-gap: 40px;
	row-gap: 25px;
	@media (max-width: 375px) {
		grid-template-columns: auto;
	}
`;

const Button = styled.button`
	/* pointer-events: not-allowed; */
	:disabled {
		cursor: not-allowed;
	}
`;

export function ButtonContainer() {
	return (
		<ContainerStyle>
			<Button title="View current newsletters">
				<Link to="/newsletters">View current newsletters</Link>
			</Button>

			<Button
				disabled
				title="Create new newsletter has not yet been implemented"
			>
				Create new newsletter
			</Button>

			<Button disabled title="Update newsletter has not yet been implemented">
				Update newsletter
			</Button>

			<Button
				disabled
				title="Create email template has not yet been implemented"
			>
				Create email template
			</Button>

			<Button
				disabled
				title="Create single thrasher has not yet been implemented"
			>
				Create single thrasher
			</Button>

			<Button
				disabled
				title="Create multi thrasher has not yet been implemented"
			>
				Create multi thrasher
			</Button>

			<Button
				disabled
				title="Update email template has not yet been implemented"
			>
				Update email template
			</Button>

			<Button
				disabled
				title="Update single thrasher has not yet been implemented"
			>
				Update single thrasher
			</Button>

			<Button
				disabled
				title="Update multi thrasher has not yet been implemented"
			>
				Update multi thrasher
			</Button>
		</ContainerStyle>
	);
}
