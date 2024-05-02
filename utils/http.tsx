export async function post(url: string, body: any) {
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });
  return response;
}
