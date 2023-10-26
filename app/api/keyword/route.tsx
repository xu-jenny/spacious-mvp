import { NextResponse } from "next/server";
import { addressToCoord } from "../location/utils";
import { primary_tag_fts, relevantTags, tangential_tag_fts } from "./utils";
import { getIntersectSuburbs } from "@/clients/supabase";

export async function POST(req: Request) {
  console.log("hit relevance POST endpoint", req);
  const { query, locations, type } = await req.json();
  console.log(query, type);
  if (type == "tangential") {
    let result = await tangential_tag_fts(query, locations);
    return NextResponse.json({ data: result, status: 200 });
  }
  let result = await primary_tag_fts(query, locations);
  return NextResponse.json({ data: result, status: 200 });
}
