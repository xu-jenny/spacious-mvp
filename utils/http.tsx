export async function post(url: string, body: any) {
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      'x-api-key': process.env.NEXT_PUBLIC_BACKEND_API_KEY ?? ""
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });
  return response;
}

export async function get<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { "x-api-key": process.env.NEXT_PUBLIC_BACKEND_API_KEY ?? "" },
  });

  if (!response.ok) {
    // Optionally handle non-2xx status codes here
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: T = await response.json();
  return data;
}
