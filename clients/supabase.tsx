import { createEmbedding } from "@/app/indexUtils";
import { SearchResult } from "@/app/search";
import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function filterLocation(location: string) {
  const { data, error } = await supabaseClient
    .from("master")
    .select("title, summary, tags")
    .eq("location", location);
  // .eq("tagGroup", "Urban  Land Use");
  return data;
}

export async function getIntersectSuburbs(
  lon: number,
  lat: number,
  radius: number
) {
  const { data, error } = await supabaseClient.rpc("get_intersect_suburbs", {
    lon,
    lat,
    radius,
  });
  if (error != null) {
    console.error("error executing supabase func get_intersect_suburbs", error);
    return "server error, please try again later";
  }
  if (data != null && data.length > 0) {
    let states = new Set();
    let suburbs: String[] = [];
    data.forEach((obj: { suburb: String; state: String }) => {
      states.add(obj.state);
      suburbs.push(obj.suburb);
    });
    return { suburbs, states };
  }
  return "location provided is invalid, are you sure it's in AU?";
}

export async function invokeSupabaseFunction(functionName: string, args: any) {
  const { data, error } = await supabaseClient.rpc(functionName, args);
  if (error) {
    console.error("error on supabase function ", functionName, error);
    return null;
  }
  return data;
}
export async function getTagEmbedding(
  tag: string
): Promise<null | undefined | string> {
  const { data, error } = await supabaseClient
    .from("embeddings")
    .select("embedding")
    .eq("content", tag); // TODO: use .toLower() and make all embeddings content lowercase

  if (error && error.code != "PGRST116") {
    console.error("Failed to fetch embeddings from supabase.", error);
    return null;
  }
  if (data != null && data.length > 0) {
    console.log("found same text in supabase embeddings:", data);
    return data[0].embedding;
  }
  // embedding doesn't exist, create a new one
  let embedding = await createEmbedding(tag);
  console.log(
    "embedding doesn't exist in embedding table, created new one.",
    typeof embedding,
    embedding.length
  );
  if (typeof embedding === "string") {
    console.error("error creating embedding:", embedding);
    return null;
  }
  if (embedding != null && typeof embedding === "object") {
    const vector = `[${embedding.join(", ")}]`;
    const { error } = await supabaseClient
      .from("embeddings")
      .insert({ embedding: vector, content: tag.toLowerCase() });
    if (error != null) {
      console.error("error inserting new embedding:", error);
    }
    return vector;
  }
  return null;
}

export type EmbeddingResult = { id: number; content: string; similarity: number }

export async function match_tag(
  tagEmbedding: string
): Promise<EmbeddingResult[] | null> {
  const { data, error } = await supabaseClient.rpc("match_tags", {
    query_embedding: tagEmbedding,
    match_threshold: 0.7,
    match_count: 10,
  });
  console.log("output of match_tags", data);
  if (error != null) {
    console.error(
      "error invoking match_tags",
      typeof tagEmbedding,
      tagEmbedding.length,
      error
    );
  }
  return data;
}


export type Dataset = {
  id: string;
  title: string;
  summary: string;
  lastUpdated: string;
  firstPublished: string;
  location: string;
  publisher: string;
  topic: string;
  subtags: string[];
  originalUrl: string;
  // ----------------------------------------------------------------
  publisherContact?: string | null;
  metadata?: string | null;
  datasetUrl?: string | null;
  locationType?: string | null;
  license?: string | null;
  "df.head"?: string | null;
  "df.shape"?: string | null;
  "df.value_counts"?: string | null;
  "df.info"?: string | null;
  "df.desc"?: string | null;
  "df.isna"?: string | null;
  corr?: string | null;
  csv_url?: string | null;
};
export async function getDataset(dsMetadata: SearchResult): Promise<Dataset | null> {
  if (dsMetadata.dataset_source === "LASERFICHE"){
    return dsMetadata as Dataset
  }
  let tablename = "US_USGS"
  switch(dsMetadata.dataset_source){
    case "USGOV":
      tablename = "US_USGOV"
    case "NYOPEN":
      tablename = "US_NYOPEN"
    // case "LASERFICHE": 
    //   tablename = "US_LaserFiche"; 
  }
  const { data, error } = await supabaseClient
    .from(tablename)
    .select("*")
    .eq("id", dsMetadata.id);
  if (error != null) {
    console.error("error fetching dataset id", dsMetadata.id, error);
    return null;
  }
  if (data == null) {
    return null;
  }
  return data[0];
}

