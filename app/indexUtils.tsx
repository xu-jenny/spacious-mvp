import { getTagEmbedding, match_tag } from "@/clients/supabase";
import { primary_tag_fts, tangential_tag_fts } from "./api/search/utils";
import { getIntersectPlaces } from "./api/location/utils";
import { addressToCoord } from "./api/location/utils";

export interface IFormInput {
  address?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  message: string;
}

export async function parseLocationFormInput(
  data: IFormInput
): Promise<string[] | null> {
  let interestedLocations = null;
  if (data["latitude"] && data["longitude"]) {
    let locations = await getIntersectPlaces(
      { lat: data["latitude"], lon: data["longitude"] },
      data["radius"]
    );
    interestedLocations = locations;
  } else if (data["address"]) {
    let coords = await addressToCoord(data.address);
    if (coords != null) {
      let locations = await getIntersectPlaces(coords, data["radius"]);
      interestedLocations = locations;
    }
  } else if (data["region"]) {
    let stateMap = {
      Victoria: "VIC",
      "Western australia": "WA",
      "New south wales": "NSW",
      Queensland: "QLD",
      Tasmaina: "TAS",
    };
    if (data["region"] in stateMap) {
      // @ts-ignore
      interestedLocations = [stateMap[data["region"]]];
    } else {
      interestedLocations = [data["region"]];
    }
  }
  return interestedLocations;
}

export async function getSupabaseData(
  primary_tag: string,
  tangential_tags: string | undefined,
  locations: string
): Promise<{ primaryData: any[] | null; tangentialData: any[] | null }> {
  console.log(
    `Calling supabase Query with params primaryTag: ${primary_tag}, Locations: ${locations}`
  );
  let primaryData = await primary_tag_fts(primary_tag, locations);
  let tangentialData = null;
  console.log(
    "tangential data search condition fulled: ",
    tangential_tags != null
  );
  if (tangential_tags != null) {
    tangentialData = await tangential_tag_fts(
      tangential_tags.toLowerCase().replaceAll(", ", ","),
      locations
    );
  }
  return {
    primaryData, //: result["primarytagData"],
    tangentialData, //: result["tangentialTagData"],
  };
}

export type AgentResponse = {
  primary_tag?: string;
  tangential_tags?: string;
};

export async function processChatResponse(
  d: AgentResponse,
  interestedLocations: string[]
): Promise<{
  aiMessage: string;
  primaryData: any[];
  tangentialData: any[];
}> {
  if (!("primary_tag" in d) || d["primary_tag"] == null) {
    return {
      aiMessage:
        "I'm sorry, I was not able to find a primary tag that matches what you are searching for. Could you please ask me in anther way?",
      primaryData: [],
      tangentialData: [],
    };
  }

  let ftsData = await getSupabaseData(
    d["primary_tag"],
    d["tangential_tags"],
    interestedLocations.join(",")
  );
  let semanticData = await semanticSearch(d["primary_tag"]);

  // concat two results together
  let primaryData = [];
  if (
    ftsData != null &&
    "primaryData" in ftsData &&
    ftsData["primaryData"] != null
  ) {
    primaryData = ftsData["primaryData"];
  }
  if (semanticData != null && semanticData.length > 0) {
    primaryData = [...primaryData, ...semanticData];
  }

  let tangentialData = ftsData["tangentialData"] || [];
  let aiMessage = `I think the dataset tag you are interested in is ${d["primary_tag"]}. Some suggested tags are ${d["tangential_tags"]},`;
  aiMessage +=
    primaryData.length > 0
      ? `There are ${primaryData.length} records matching the primary tag.`
      : `There isn't any corresponding record matching the primary tag. If you believe the dataset tag is correct, please press this button to request the dataset!`;
  return {
    aiMessage,
    primaryData,
    tangentialData,
  };
}

export async function semanticSearch(tag: string): Promise<string[] | null> {
  let embedding = await getTagEmbedding(tag);
  if (embedding == null) return null;
  // call semantic search function on supabase
  let tags = match_tag(embedding)
  return tags;
}
