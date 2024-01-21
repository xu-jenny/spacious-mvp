import { getTagEmbedding, match_tag, supabaseClient } from "@/clients/supabase";
import { primary_tag_fts, tangential_tag_fts } from "./api/search/utils";
import { getIntersectPlaces } from "./api/location/utils";
import { addressToCoord } from "./api/location/utils";
import { Tensor } from "@xenova/transformers/types/utils/tensor";

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
  queryLoc: string
): Promise<{ primaryData: any[] | null; tangentialData: any[] | null }> {
  console.log(
    `Calling supabase Query with params primaryTag: ${primary_tag}, Location: ${queryLoc}`
  );
  let primaryData = await primary_tag_fts(primary_tag, queryLoc);
  let tangentialData = null;
  // if (tangential_tags != null) {
  //   tangentialData = await tangential_tag_fts(
  //     tangential_tags.toLowerCase().replaceAll(", ", ","),
  //     queryLoc
  //   );
  // }
  return {
    primaryData, //: result["primarytagData"],
    tangentialData, //: result["tangentialTagData"],
  };
}

export type AgentResponse = {
  primary_tag?: string;
  tangential_tags?: string;
};

type SearchResult = {
  id: number;
  title: string;
  summary: string;
  datasetUrl: string;
  publisher: string;
  location: string;
  topic: string;
};

export async function processChatResponse(
  d: AgentResponse,
  queryLoc: string
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
  const locPattern = `%${queryLoc}%`;
  let semanticData = await semanticSearch(d["primary_tag"], locPattern);
  let ftsData = await getSupabaseData(
    d["primary_tag"],
    d["tangential_tags"],
    locPattern
  );

  console.log("fts data:", ftsData, "semantic data: ", semanticData);
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
    let combined = [...primaryData, ...semanticData];
    primaryData = Array.from(new Set(combined));
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

export async function semanticSearch(
  tag: string,
  locPattern: string
): Promise<SearchResult[] | null> {
  let embedding = await getTagEmbedding(tag);
  if (embedding == null) return null;
  // call semantic search function on supabase
  let matchingTags = await match_tag(embedding);
  if (matchingTags == null) return null;
  if (matchingTags != null && matchingTags.length > 0) {
    let tags = matchingTags.map((tag) => tag.content);
    const { data, error } = await supabaseClient
      .from("master_us")
      .select("id, title, summary, location, topic, publisher, datasetUrl")
      .like("location", locPattern)
      .in("topic", tags);
    console.log("semantic search data: ", data, "error:", error);
    return data;
  }
  return null;
}

 export async function createEmbedding(text: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./embeddingWorker.tsx", import.meta.url),
      { type: "module" }
    );
    worker.onmessage = (event: MessageEvent) => {
      if (event.data.status === "complete") {
        console.log("finished creating embedding", event.data.output.length);
        resolve(event.data.output);
      }
    };
    worker.onerror = (error: ErrorEvent) => {
      console.error(error.message);
      reject(error);
    };
    worker.postMessage({ text });
  });
}

