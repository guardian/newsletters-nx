import { useEffect, useState } from "react";

export function Api() {
  const [response, setResponse] = useState<any | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      const fetchResponse = await fetch('/api/health');

      setResponse(await fetchResponse.json());
    }
    fetchData();
  }, []);
  return <pre>{JSON.stringify(response, null, 2)}</pre>;
}
