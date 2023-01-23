import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export const ErrorPage = () => {
	const error = useRouteError();
	console.log({ rawError: error });

	let status = 500;
	let statusText = 'Error';

	if (isRouteErrorResponse(error)) {
		status = error.status;
		statusText = error.statusText;
	}

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
