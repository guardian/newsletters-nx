import {
	Container,
	TextArea,
	TextInput,
} from '@guardian/source-react-components';
import { useLoaderData } from 'react-router';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';

export const NewsletterCreateView = () => {
	const list = useLoaderData();

	const existingNewsLetters = (list || []) as Newsletter[];
	const existingIds = existingNewsLetters.map(
		(newsletter) => newsletter.identityName,
	);

	return (
		<Container>
			<h2>Create newsletter</h2>
			<TextInput label="name" />
			<TextArea label="desription" />
			<p>EXISTING IDS = {existingIds.join()}</p>
		</Container>
	);
};
