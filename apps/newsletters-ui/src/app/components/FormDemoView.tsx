import {
	biscuitSchema,
	personSchema,
} from '@newsletters-nx/newsletters-data-client';
import { SimpleForm } from './SimpleForm';

export const FormDemoView = () => {
	return (
		<main>
			<div>
				<SimpleForm
					schema={personSchema}
					title="Please fill this out"
					initalData={{ name: 'bob', age: 1 }}
					submit={(data) => {
						console.table(data);
						alert(`${data.name} is ${data.age} years old.`);
					}}
				/>

				<SimpleForm
					schema={biscuitSchema}
					title="Describe your biscuit"
					submitButtonText="Biscuit data ready"
					initalData={{
						name: 'Jammy Dodger',
						shape: 'round',
						filling: 'jam',
						sugarOnTop: true,
					}}
					submit={(data) => {
						console.table(data);
						alert(
							`A ${data.name} is a kind of biscuit with a ${data.shape} shape ${
								data.sugarOnTop ? 'and sugar on top' : ''
							}.`,
						);
					}}
				/>
			</div>
		</main>
	);
};
