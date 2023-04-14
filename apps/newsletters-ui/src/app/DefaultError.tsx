import { ContentWrapper } from './ContentWrapper';

export const DefaultError = ({
	status,
	statusText,
}: {
	status: number;
	statusText: string;
}) => (
	<ContentWrapper>
		<div>
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>
				<i>
					{status} : {statusText}
				</i>
			</p>
		</div>
	</ContentWrapper>
);
