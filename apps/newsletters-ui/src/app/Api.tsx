import { useEffect, useState } from "react";

export function Api() {
  const [response, setResponse] = useState<Response | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      const fetchResponse = (await fetch("/api/health"))
      setResponse(await fetchResponse.json())
    }
    fetchData();
  }, []);
  return (
    <p>{response ? 'We\'ve had a response' : 'We haven`t yet had a response'}</p>
  )

}
