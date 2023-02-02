import { useEffect, useState } from 'react';

interface HealthData {
	status: string;
	message: string;
	stringFromLib: string;
}

export const HealthCheck: React.FC = () => {
	const [response, setResponse] = useState<HealthData>();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetch('/api/health')
			.then((response: Response) => response.json())
			.then((data: HealthData) => {
				setResponse(data);
				setIsLoading(false);
			})
			.catch((error: unknown /* FIXME! */) => {
				console.error('Error fetching health data:', error);
				setIsLoading(false);
			});
	}, []);

	return isLoading ? (
		<p>Loading...</p>
	) : (
		<div>
			<p>Json from API request:</p>
			<pre>{JSON.stringify(response)}</pre>
		</div>
	);
};

export const Api = () => <HealthCheck />;
