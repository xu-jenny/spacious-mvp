import { getTagEmbedding, match_tag, supabaseClient } from "@/clients/supabase";
import { USDatasetSource } from "@/components/index/SearchButton";
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

export type AgentResponse = {
  primary_tag?: string;
  tangential_tags?: string;
};

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
      .or(`topic.in.(${tags}),subtags.ilike.%${tag}%`);
    if (dsSource != null) {
      query = query.eq("dataset_source", dsSource).ilike("title", "%04011%"); //.or(`location.ilike.${locPattern}`);
      // if (dsSource == "LASERFICHE"){
      //   // tags.forEach((tag) => query = query.ilike("subtags", tag))
      //   query = query.ilike("subtags", "%soil management%")
      // }
    } else {
      query = query.or(
        `location.ilike.${locPattern},location.ilike.%United States%`
      );
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
      new URL("./embeddingGteWorker.tsx", import.meta.url),
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

export async function createGTEEmbedding(text: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./embeddingGteWorker.tsx", import.meta.url),
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
