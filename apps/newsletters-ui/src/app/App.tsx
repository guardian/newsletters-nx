import styled from '@emotion/styled';
import { Api } from './Api';
import { DataClientTest } from './DataClientTest';
import { EmotionTest } from './components/EmotionTest';

const StyledApp = styled.div`
	// Your style here
`;

export function App() {
  return (
    <StyledApp>
      <p>Newsletters is running</p>
      <Api/>
      <DataClientTest />
      <EmotionTest theme='dark'/>
      <EmotionTest theme='light'/>
    </StyledApp>
  );
}
