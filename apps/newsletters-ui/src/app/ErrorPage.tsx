import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ContentWrapper } from './ContentWrapper';
import { DefaultError } from './DefaultError';

const getErrorMessage = (error: unknown): string => {
	if (typeof error === 'string') {
		return error;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return 'Unknown Error';
};

const parseError = (error: unknown): { status: number; statusText: string } => {
	if (isRouteErrorResponse(error)) {
		return error;
	}
	return {
		status: 500,
		statusText: getErrorMessage(error),
	};
};
export const ErrorPage = () => {
	const error = useRouteError();

	const { status, statusText } = parseError(error);

	switch (status) {
		case 404:
			return <ContentWrapper>Not Found</ContentWrapper>;
		default:
			return <DefaultError status={status} statusText={statusText} />;
	}
};
