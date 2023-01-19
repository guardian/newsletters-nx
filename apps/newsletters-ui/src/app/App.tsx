import styled from '@emotion/styled';
import { Api } from './Api';

const StyledApp = styled.div`
  // Your style here
`;

export function App() {
  return (
    <StyledApp>
      <p>Newsletters is running</p>
      <Api/>
    </StyledApp>
  );
}

export default App;
