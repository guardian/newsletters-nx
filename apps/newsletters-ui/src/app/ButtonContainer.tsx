import styled from '@emotion/styled';
import { LargeButton } from './LargeButton';

const ContainerStyle = styled.div`
	display: grid;
	grid-template-columns: auto auto auto;
	column-gap: 50px;
	margin: 50px;
`;

export function ButtonContainer() {
	return (
		<ContainerStyle>
			<LargeButton>View current newsletters</LargeButton>
			<LargeButton>Create new newsletter</LargeButton>
			<LargeButton>Update newsletter</LargeButton>
			<LargeButton>Create email template</LargeButton>
			<LargeButton>Create single thrasher</LargeButton>
			<LargeButton>Create multi thrasher</LargeButton>
			<LargeButton>Update email template</LargeButton>
			<LargeButton>Update single thrasher</LargeButton>
			<LargeButton>Update multi thrasher</LargeButton>
		</ContainerStyle>
	);
}
