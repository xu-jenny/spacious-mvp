import { supabaseClient } from "@/utils/supabase";
import { NextResponse } from "next/server";

async function searchForRecord() {
  console.log("hello!");
  const { data, error } = await supabaseClient
    .from("master")
    .select("title, summary, tags")
    .eq("location", "Ipswich")
    .eq("tagGroup", "Urban  Land Use");
  return data;
}

async function supabaseFunc() {
  const { data, error } = await supabaseClient.rpc("get_intersect_suburbs", {
    lat: -33.8688,
    long: 151.2093,
  });
  return data;
}

type Coordinate = {
  lat: number;
  lon: number;
};
async function addressToCoord(address: string): Promise<Coordinate | null> {
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

export async function GET(request: Request) {
  console.log("location et");
  // let records = await searchForRecord();
  // let records = await supabaseFunc();
  let coord = await addressToCoord("10-64 Jackson Ave, Long Island City 11101");
  if (coord == null) {
    return NextResponse.json({ status: 204 });
  }
  return NextResponse.json({ lat: coord.lat, lon: coord.lon, status: 200 });
}

export async function POST(req: Request) {
  const { address, coord } = await req.json();
  console.log(address, coord);
  let location;
  if (coord != null) {
    location = coord;
  } else if (address != null) {
    location = await addressToCoord(address);
    console.log("address ", location);
  }
  return NextResponse.json({ data: location, status: 200 });
}
