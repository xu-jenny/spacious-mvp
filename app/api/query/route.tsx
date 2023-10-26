import {
  getIntersectSuburbs,
  invokeSupabaseFunction,
  supabaseClient,
} from "@/clients/supabase";
import { NextResponse } from "next/server";
import { addressToCoord } from "../location/utils";
import {
  fuzzyMatch,
  relevantTags,
  semanticMatchTags,
} from "../relevance/utils";

export async function POST(req: Request) {
  console.log("hit query POST endpoint", req);
  const { address, coord, radius, query, type } = await req.json();

  if (type == "keyword") {
    let result = await fuzzyMatch(query);
    return NextResponse.json({ data: result, status: 200 });
  }
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
    // get relevant tags
    let tags = await relevantTags(query);
    if (tags != null && "primaryTag" in tags) {
      if ("tangentialTags" in tags) {
        let result = await semanticMatchTags(
          tags["primaryTag"],
          tags["tangentialTags"]!,
          suburbs
        );
        return {
          primaryData: result["primaryTagData"],
          tangentialData: result["tangentialTagData"],
          status: 200,
        };
      } else {
        console.log("LLM did not generate tangential tags ", tags);
        let result = await invokeSupabaseFunction("primary_tag_similiarty", {
          primaryTag: tags.primaryTag,
          match_threshold: 0.5,
          match_count: 10,
        });
        return {
          primaryData: result,
          status: 200,
        };
      }
    }
    return NextResponse.json({
      error: "We were not able to find relevant dataset tags for your query",
      status: 200,
    });
  } else {
    return NextResponse.json({
      error:
        "We were not able to extract a location from the provided query. Are you sure the location is in Australia?",
      status: 204,
    });
  }
}
