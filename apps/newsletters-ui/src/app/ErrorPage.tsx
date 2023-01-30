import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

const parseError = (error: unknown): { status: number; statusText: string } => {
	if (isRouteErrorResponse(error)) {
		return error;
	}

	return {
		status: 500,
		statusText: 'Unknown Error',
	};
};

export const ErrorPage = () => {
	const error = useRouteError();
	const { status, statusText } = parseError(error);

	return (
		<div id="error-page">
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>
				<i>
					{status} : {statusText}
				</i>
			</p>
		</div>
	);
};
