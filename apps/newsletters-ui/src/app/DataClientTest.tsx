import { newslettersDataClient } from '@newsletters-nx/newsletters-data-client';

export const DataClientTest = () => (
  <div style={{ background: 'yellow' }}>
    <p>the newslettersDataClient function returns:</p>
    <pre>{newslettersDataClient()}</pre>
  </div>
);
