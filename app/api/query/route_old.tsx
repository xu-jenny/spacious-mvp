// import { getIntersectSuburbs } from "@/clients/supabase";
// import { NextResponse } from "next/server";
// import { addressToCoord, getLocationFromPrompt } from "../location/utils";
// import {
//   primary_tag_fts,
//   relevantTags,
//   subtags_fts,
// } from "../search/utils";

// export async function POST(req: Request) {
//   console.log("hit query POST endpoint");
//   let { address, coord, radius, query } = await req.json();

//   let location;
//   if (address == null && coord == null) {
//     console.log("calling openai to get location from prompt");
//     let locData = await getLocationFromPrompt(query);
//     if (locData?.radius != null && radius == null) {
//       radius = locData?.radius;
//     }
//     if (locData?.address != null) {
//       location = await addressToCoord(locData.address);
//     } else if (locData?.latitude != null && locData?.longitude != null) {
//       location = { lat: locData.latitude, lon: locData.longitude };
//     } else if (locData?.location != null) {
//       location = locData.location;
//     }
//   } else {
//     if (coord != null) {
//       location = coord;
//     } else if (address != null) {
//       location = await addressToCoord(address);
//     }
//   }
//   console.log("location parsed:", location, radius);
//   if (location == null) {
//     return NextResponse.json({
//       error:
//         "We were not able to extract a location from the provided query. Are you sure the location is in Australia?",
//       status: 204,
//     });
//   }

//   let locations;
//   if (location.lon != null && location.lat != null) {
//     let resp = await getIntersectSuburbs(
//       location.lon,
//       location.lat,
//       radius == null ? 0 : radius * 1000
//     );
//     if (resp != null && typeof resp != "string") {
//       let { suburbs, states } = resp;
//       locations = [...suburbs, ...Array.from(states.values())].join(",");
//     } else {
//       return NextResponse.json({
//         error:
//           "We were not able to extract a location from the provided query. Are you sure the location is in Australia?",
//         status: 204,
//       });
//     }
//   } else {
//     let stateMap = {
//       Victoria: "VIC",
//       "Western australia": "WA",
//       "New south wales": "NSW",
//       Queensland: "QLD",
//       Tasmaina: "TAS",
//     };
//     if (location in stateMap) {
//       // @ts-ignore
//       locations = stateMap[location];
//     } else {
//       locations = location;
//     }
//   }
//   // console.log("final locations:", locations);
//   let tags = await relevantTags(query);
//   console.log("TAGS", tags);
//   if (tags != null && "primaryTag" in tags) {
//     if ("tangentialTags" in tags) {
//       console.log(tags["primaryTag"], tags["tangentialTags"], locations);
//       let primaryData = await primary_tag_fts(tags["primaryTag"], locations);
//       let tangentialData = await subtags_fts(
//         tags["tangentialTags"]!.join(","),
//         locations
//       );

//       return NextResponse.json({
//         primaryData, //: result["primaryTagData"],
//         tangentialData, //: result["tangentialTagData"],
//         status: 200,
//       });
//     } else {
//       console.log("LLM did not generate tangential tags ", tags);
//       let primaryData = await primary_tag_fts(tags["primaryTag"], locations);
//       return NextResponse.json({
//         primaryData, //: result,
//         status: 200,
//       });
//     }
//   }
//   return NextResponse.json({
//     error: "We were not able to find relevant dataset tags for your query",
//     status: 200,
//   });
// }
