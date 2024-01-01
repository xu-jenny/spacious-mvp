import { relevantTagsWithoutParsing } from "@/app/api/search/utils";
import {
    Coordinate,
  addressToCoord,
  getLocationFromPrompt,
  isCoordinate,
} from "@/app/api/location/utils";
import { getIntersectSuburbs } from "@/clients/supabase";
import { DynamicTool } from "langchain/tools";

// const locationExtractor = new DynamicStructuredTool({
//     name: "location_extractor",
//     description: "Find the locations where the user is interested in",
//     func: async ({ location }) => {

//     },
//     schema: z.object({
//       location: z.string().describe("The city and state, e.g. San Francisco, CA"),
//       unit: z.enum(["celsius", "fahrenheit"]),
//     }),
//   });

async function extractLocation(query: string): Promise<string> {
  let locData = await getLocationFromPrompt(query);
  if (locData == null) {
    return "Invalid location";
  }
  let radius = null;
  let location = null;
  if (locData?.radius != null) {
    radius = locData?.radius;
  }
  if (locData?.address != null) {
    location = await addressToCoord(locData.address);
  } else if (locData?.latitude != null && locData?.longitude != null) {
    location = { lat: locData.latitude, lon: locData.longitude } as Coordinate;
  } else if (locData?.location != null) {
    location = locData.location;
  }

  if (location == null) {
    return "Invalid location";
  }

  let locations;
  if (isCoordinate(location)) {
    let resp = await getIntersectSuburbs(
      (location as Coordinate).lon,
      (location as Coordinate).lat,
      radius == null ? 0 : radius * 1000
    );
    if (resp != null && typeof resp != "string") {
      let { suburbs, states } = resp;
      locations = [...suburbs, ...Array.from(states.values())].join(",");
    } else {
      return "Invalid location";
    }
  } else {
    let stateMap: { [key: string]: string } = {
      "Victoria": "VIC",
      "Western australia": "WA",
      "New south wales": "NSW",
      "Queensland": "QLD",
      "Tasmaina": "TAS",
    };
    if (typeof location === "string" && location in stateMap) {
      locations = stateMap[location];
    } else {
      locations = location as string;
    }
  }
  return locations;
}


async function recommendTag(query: string): Promise<string> {
    let tags = await relevantTagsWithoutParsing(query);
    if(tags == null){
        return "No tags found";
    }
    return tags
}

export const locationExtactor = new DynamicTool({
    name: "location_extractor",
    description: "Find the locations the user is interested in",
    func: extractLocation,
});

export const tagRecommender = new DynamicTool({
    name: "tag_recommender",
    description:
      "Generate a primary tag that directly relates to a question and tangential tags that supplement the primary tag.",
    func: recommendTag,
  })

