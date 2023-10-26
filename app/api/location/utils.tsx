import { openaiChat } from "@/clients/openai";
import { getIntersectSuburbs } from "@/clients/supabase";

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

// export async function getLocations(location: Coordinate, radius: number){
//   let resp = await getIntersectSuburbs(
//     location.lon,
//     location.lat,
//     radius == null ? 0 : radius
//   );
//   if (resp != null && typeof resp != "string") {
//     let { suburbs, states } = resp;
//     const { data, error } = await supabaseClient
//       .from("master")
//       .select("title, summary, tags, location")
//       .in("location", suburbs);
//     return NextResponse.json({ data, status: 200 });
//   }
// }

interface LocationData {
  latitude?: number;
  longitude?: number;
  radius?: number;
  region?: string;
  location?: string;
  address?: string;
  error?: string;
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
  console.log(response);
  if (response != null) {
    return parseLocation(response);
  }
  return null;
}

const LOCATION_PROMPT = `Extract the location from a user query. The query can range from an address, a coordinate or an area, and possibly with a radius to cover an area. You should differentiate between a state, location and address. State is one of the 6 states in Australia and location can be a city or a town in Australia, but location is not an address.
Output all distance in kilometers. If you don't recognize a location in the query, respond "NEED_LOCATION". The location must be in Australia, if it is not, output "LOCATION_NOT_SUPPORTED". If you need more information about the location, output "NEED_MORE_INFO"

Examples:
Input: Groundwater monitoring data within 1 mile of (-34.072415, 150.456551)
You should output:
Latitude: -34.072415
Longitude: 150.456551
Distance: 1.6km

Input: What locations in NSW have been identified as having PFAS-contamination?
You should output:
Location: NSW

Input: Groundwater PFAS concentrations near industrial sites in Melbourne
You should output:
Location: Melbourne

Input: There is contamination at Georgetown, what waterways may have been impacted?
You should output:
Error: NEED_MORE_INFO
Reasoning: there are multiple places named Georgetown in Australia and other places in the world

Input: Water table depth at sites with elevated PFAS concentrations within 5500 meters of 1470 McCallums Creek Rd, Mount Glasgow VIC 3371, Australia
You should output:
Address: 1470 McCallums Creek Rd, Mount Glasgow VIC 3371, Australia
Distance: 5.5km

Input: Does my drinking water have elevated levels of PFAS?
You should output:
Error: NEED_LOCATION

Input: PFAS was detected in a drinking water well near New York. How many other people may have PFAS impacts in their well water?
You should output:
Error: LOCATION_NOT_SUPPORTED

If you can determine a location, never output Error. Only output in the same format as the example outputs.`;
