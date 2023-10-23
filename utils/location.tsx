export type Coordinate = {
  lat: number;
  lon: number;
};
export async function addressToCoord(
  address: string
): Promise<Coordinate | null> {
  const baseUrl = "https://nominatim.openstreetmap.org/search";
  const query = encodeURIComponent(address);
  const url = `${baseUrl}?q=${query}&format=json`;
  const data = fetch(url)
    .then((resp) => resp.json())
    .then((data) => {
      if (data.length) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        return { lat, lon } as Coordinate;
      } else {
        console.error("No results found for this address.");
        return null;
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      return null;
    });
  return data;
}
