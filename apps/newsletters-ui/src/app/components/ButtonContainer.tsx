import styled from '@emotion/styled';
import { useNavigate } from 'react-router';
import {
	biscuitSchema,
	personSchema,
} from '@newsletters-nx/newsletters-data-client';
import { SimpleForm } from './SimpleForm';

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
			<button onClick={() => navigate('/newsletters/')}>
				View current newsletters
			</button>
			<button onClick={() => navigate('/create/')}>
				Create new newsletter
			</button>
			<button
				onClick={() => alert('Update newsletter has not yet been implemented')}
			>
				Update newsletter
			</button>
			<button
				onClick={() =>
					alert('Create email template has not yet been implemented')
				}
			>
				Create email template
			</button>
			<button
				onClick={() =>
					alert('Create single thrasher has not yet been implemented')
				}
			>
				Create single thrasher
			</button>
			<button
				onClick={() =>
					alert('Create multi thrasher has not yet been implemented')
				}
			>
				Create multi thrasher
			</button>
			<button
				onClick={() =>
					alert('Update email template has not yet been implemented')
				}
			>
				Update email template
			</button>
			<button
				onClick={() =>
					alert('Update single thrasher has not yet been implemented')
				}
			>
				Update single thrasher
			</button>
			<button
				onClick={() =>
					alert('Update multi thrasher has not yet been implemented')
				}
			>
				Update multi thrasher
			</button>

			<div>
				<SimpleForm
					schema={personSchema}
					title="Please fill this out"
					initalData={{ name: 'bob', age: 1 }}
					submit={(data) => {
						console.table(data);
					}}
				/>

				<SimpleForm
					schema={biscuitSchema}
					title="Describe your biscuit"
					initalData={{
						name: 'Jammy Dodger',
						shape: 'round',
						filling: 'jam',
						sugarOnTop: true,
					}}
					submit={(data) => {
						console.table(data);
					}}
				/>
			</div>
		</ContainerStyle>
	);
}
