import styled from '@emotion/styled';
import { Api } from './Api';
import { ButtonContainer } from './Components/ButtonContainer';
import { DataClientTest } from './DataClientTest';

const StyledApp = styled.div`
	// Your style here
`;

export function App() {
	return (
		<StyledApp>
			<p>Newsletters is running</p>
			<Api />
			<DataClientTest />
			<ButtonContainer />
		</StyledApp>
	);
}
