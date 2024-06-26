import { getTagEmbedding, match_tag, supabaseClient } from "@/clients/supabase";
import { primary_tag_fts, subtags_fts } from "./api/search/utils";
import { getIntersectPlaces } from "./api/location/utils";
import { addressToCoord } from "./api/location/utils";
import { USDatasetSource } from "@/components/index/EditTagButton";
import { SearchResult } from "./search";

export interface IFormInput {
  address?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  message: string;
  dataSource?: string;
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

export async function supabase_topic_search(
  primary_tag: string,
  queryLoc: string
): Promise<any[] | null> {
  console.log(
    `Calling supabase Query with params primaryTag: ${primary_tag}, Location: ${queryLoc}`
  );
  return await primary_tag_fts(primary_tag, queryLoc);
}

export async function supabase_subtags_search(
  tangential_tags: string,
  queryLoc: string
): Promise<any[] | null> {
  return await subtags_fts(
    tangential_tags.toLowerCase().replaceAll(", ", ","),
    queryLoc
  );
}

export type AgentResponse = {
  primary_tag?: string;
  tangential_tags?: string;
};

export async function primaryTagSearch(
  primaryTag: string,
  locPattern: string,
  dsSource: USDatasetSource | null
): Promise<SearchResult[]> {
  console.log(primaryTag, locPattern);
  let semanticData = await semanticSearch(primaryTag, locPattern, dsSource);
  let ftsData = await supabase_topic_search(primaryTag, locPattern);

  // concat two results together
  let primaryData: SearchResult[] = [];
  if (ftsData != null) {
    primaryData = ftsData;
  }
  if (semanticData != null && semanticData.length > 0) {
    let combined = [...primaryData, ...semanticData];
    primaryData = Array.from(new Set(combined));
  }

  // filter for dataset source and domain
  if (dsSource != null) {
    primaryData = primaryData.filter(
      (result: SearchResult) => result.dataset_source == dsSource
    );
  }

  primaryData.sort((a: SearchResult, b: SearchResult) => {
    if (a.location === locPattern && b.location !== locPattern) {
      return -1; // a comes first
    } else if (a.location !== locPattern && b.location === locPattern) {
      return 1; // b comes first
    } else {
      return 0; // Keep original order if both have the same preference
    }
  });
  console.log(primaryData);
  return primaryData;
}

export type DataSource = "USGOV" | "NYOPEN" | "USGS";

export async function semanticSearch(
  tag: string,
  locPattern: string,
  dsSource: USDatasetSource | null
): Promise<SearchResult[] | null> {
  let embedding = await getTagEmbedding(tag.toLowerCase());
  if (embedding == null) return null;
  // call semantic search function on supabase
  let matchingTags = await match_tag(embedding);
  if (matchingTags == null) return null;
  if (matchingTags != null && matchingTags.length > 0) {
    let tags = matchingTags.map((tag) => tag.content);
    let query = supabaseClient
      .from("master_us")
      .select(
        "id, title, summary, location, topic, publisher, datasetUrl, subtags, dataset_source, lastUpdated, firstPublished, originalUrl"
      )
      // .or(`location.ilike.${locPattern},location.ilike.%United States%`)
      // .in("topic", tags);
      .or(`topic.in.(${tags}),subtags.ilike.%${tag}%`)
    if (dsSource != null) {
      query = query.eq("dataset_source", dsSource).ilike("title", "%04011%") //.or(`location.ilike.${locPattern}`);
      // if (dsSource == "LASERFICHE"){
      //   // tags.forEach((tag) => query = query.ilike("subtags", tag))
      //   query = query.ilike("subtags", "%soil management%")
      // }
    } else {
      query = query.or(`location.ilike.${locPattern},location.ilike.%United States%`)
    }
    const { data, error } = await query;
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
