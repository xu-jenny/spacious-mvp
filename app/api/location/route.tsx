import { getIntersectSuburbs, supabaseClient } from "@/clients/supabase";
import { addressToCoord } from "@/utils/location";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("location Get");
  // let records = await searchForRecord();
  // let records = await supabaseFunc();
  let coord = await addressToCoord("10-64 Jackson Ave, Long Island City 11101");
  if (coord == null) {
    return NextResponse.json({ status: 204 });
  }
  return NextResponse.json({ lat: coord.lat, lon: coord.lon, status: 200 });
}

export async function POST(req: Request) {
  console.log("hit POST endpoint", req);
  const { address, coord, radius } = await req.json();
  console.log(address, coord);
  let location;
  if (coord != null) {
    location = coord;
  } else if (address != null) {
    location = await addressToCoord(address);
  }
  console.log("location", location);
  let resp = await getIntersectSuburbs(
    location.lon,
    location.lat,
    radius == null ? 0 : radius
  );
  console.log(resp, typeof resp);
  if (resp != null && typeof resp != "string") {
    let { suburbs, states } = resp;
    const { data, error } = await supabaseClient
      .from("master")
      .select("title, summary, tags, location")
      .in("location", suburbs);
    return NextResponse.json({ data, status: 200 });
  }

  return NextResponse.json({ data: null, status: 200 });
}
