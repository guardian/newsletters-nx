import { useLoaderData } from 'react-router';
import type { Newsletter} from '@newsletters-nx/newsletters-data-client';
import { biscuitSchema, personSchema } from '@newsletters-nx/newsletters-data-client';
import { NewsletterForm } from './NewsletterForm';
import { SimpleForm } from './SimpleForm';

export const NewsletterCreateView = () => {
	const list = useLoaderData();

	const existingNewsLetters = (list || []) as Newsletter[];
	const existingIds = existingNewsLetters.map(
		(newsletter) => newsletter.identityName,
	);

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

			<NewsletterForm existingIds={existingIds} />
		</main>
	);
};
