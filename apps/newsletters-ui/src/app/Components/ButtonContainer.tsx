import styled from '@emotion/styled';
import { LargeButton } from './LargeButton';

const ContainerStyle = styled.div`
	display: grid;
	grid-template-columns: auto auto auto;
	column-gap: 40px;
	margin: 50px;
	@media (max-width: 375px) {
		grid-template-columns: auto;
	}
`;

export function ButtonContainer() {
	return (
		<ContainerStyle>
			<LargeButton
				onClick={() =>
					alert('View current newsletters has not yet been implemented')
				}
			>
				View current newsletters
			</LargeButton>
			<LargeButton
				onClick={() =>
					alert('Create new newsletter has not yet been implemented')
				}
			>
				Create new newsletter
			</LargeButton>
			<LargeButton
				onClick={() => alert('Update newsletter has not yet been implemented')}
			>
				Update newsletter
			</LargeButton>
			<LargeButton
				onClick={() =>
					alert('Create email template has not yet been implemented')
				}
			>
				Create email template
			</LargeButton>
			<LargeButton
				onClick={() =>
					alert('Create single thrasher has not yet been implemented')
				}
			>
				Create single thrasher
			</LargeButton>
			<LargeButton
				onClick={() =>
					alert('Create multi thrasher has not yet been implemented')
				}
			>
				Create multi thrasher
			</LargeButton>
			<LargeButton
				onClick={() =>
					alert('Update email template has not yet been implemented')
				}
			>
				Update email template
			</LargeButton>
			<LargeButton
				onClick={() =>
					alert('Update single thrasher has not yet been implemented')
				}
			>
				Update single thrasher
			</LargeButton>
			<LargeButton
				onClick={() =>
					alert('Update multi thrasher has not yet been implemented')
				}
			>
				Update multi thrasher
			</LargeButton>
		</ContainerStyle>
	);
}
