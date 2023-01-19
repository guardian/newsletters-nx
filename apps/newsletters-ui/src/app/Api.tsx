import { useEffect, useState } from 'react';

export function Api() {
  const [response, setResponse] = useState<any | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      const fetchResponse = await fetch('/api/health');

      setResponse(await fetchResponse.json());
    }
    fetchData();
  }, []);
  return (
    <div style={{ background: 'skyblue' }}>
      <p>Json from API request:</p>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}
