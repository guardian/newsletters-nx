import { Api } from './Api';
import { DataClientTest } from './DataClientTest';
import { EmotionTest } from './EmotionTest';

export function App() {
	return (
		<main>
			<p>Newsletters is running</p>
			<Api />
			<DataClientTest />
			<EmotionTest theme="dark" />
			<EmotionTest theme="light" />
		</main>
	);
}
