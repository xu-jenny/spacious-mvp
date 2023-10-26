import { NextResponse } from "next/server";
import { addressToCoord } from "../location/utils";
import { fuzzyMatch, relevantTags } from "./utils";

export async function POST(req: Request) {
  console.log("hit relevance POST endpoint", req);
  const { query, type } = await req.json();
  console.log(query, type);
  if (type == "keyword") {
    let result = await fuzzyMatch(query);
    return NextResponse.json({ data: result, status: 200 });
  } else {
    // semantic match
    let tags = await relevantTags(query);
    console.log(tags);
  }

  return NextResponse.json({ data: null, status: 200 });
}
