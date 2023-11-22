import { openaiChat } from "@/clients/openai";
import { getIntersectSuburbs } from "@/clients/supabase";
import { LOCATION_PROMPT } from "@/llm/prompts";

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

interface Location {
  latitude?: number;
  longitude?: number;
  address?: string;
  location?: string;
  radius?: number;
}

function parseLocation(inputStr: string): Location | null {
  const lines = inputStr.toLowerCase().trim().split("\n");
  let data: Location = {};

  for (let line of lines) {
    const [key, value] = line.split(": ", 2);
    switch (key) {
      case "latitude":
        data.latitude = parseFloat(value);
        break;
      case "longitude":
        data.longitude = parseFloat(value);
        break;
      case "distance":
        data.radius = parseFloat(value.slice(0, -2));
        break;
      case "location":
        data.location = value[0].toUpperCase() + value.slice(1);
        break;
      case "error":
        console.error("error parsing location from openai", value);
        return null;
      case "address":
        data.address = value;
        break;
      default:
        break;
    }
  }
  return data;
}

export async function getLocationFromPrompt(
  query: string
): Promise<Location | null> {
  let response = await openaiChat(LOCATION_PROMPT, query);
  // let response = "Location: Victoria";
  console.log("response from Openai on location", response);
  if (response != null) {
    return parseLocation(response);
  }
  return null;
}

export async function getIntersectPlaces(
  coords: Coordinate,
  radius?: number | null
): Promise<string[] | null> {
  let resp = await getIntersectSuburbs(
    coords.lon,
    coords.lat,
    radius == null ? 0 : radius * 1000
  );
  if (resp != null && typeof resp != "string") {
    let { suburbs, states } = resp;
    return [...suburbs, ...Array.from(states.values())] as string[];
  }
  return null;
}


export const isCoordinate = (location: any) =>
  typeof location === "object" &&
  "lon" in location &&
  "lat" in location &&
  location.lon != null &&
  location.lat != null;
