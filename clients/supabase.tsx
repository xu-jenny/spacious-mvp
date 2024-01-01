import { DatasetMetadata } from "@/components/MetadataTable";
import { ChatMessage } from "@/components/index/ChatInput";
import { createEmbedding } from "@/utils/embeddingService";
import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function filterLocation(location: string) {
  console.log("hello!");
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

export async function getTagEmbedding(tag: string): Promise<
  | null | undefined
  | number[]> {
  const { data, error } = await supabaseClient
    .from("embedding")
    .select("embedding")
    .eq("text", tag.toLowerCase());

  if (error && error.code != "PGRST116") {
    console.error("Failed to fetch embeddings from supabase.", error);
    return null;
  }
  if (data != null) {
    console.log("tag from supabase:", data);
    return data[0].embedding;
  }
  // embedding doesn't exist, create a new one
  let embedding = await createEmbedding(tag);
  if (typeof embedding === "string") {
    console.error("error creating embedding:", embedding);
    return null;
  }
  if (embedding != null && typeof embedding === "object") {
    await supabaseClient
      .from("embedding")
      .insert({ embedding, text: tag.toLowerCase() });
    return embedding;
  }
}

export async function sampleData(): Promise<DatasetMetadata[]> {
  const { data } = await supabaseClient
    .from("master")
    .select(
      "id, created_at, title, summary, lastUpdated, location, metadata, primary_tag, metadata, datasetUrl, publisher, tangential_tag"
    )
    .limit(5);
  console.log(data);
  // .eq("tagGroup", "Urban  Land Use");
  return data as unknown as DatasetMetadata[];
}

export async function match_tag(tagEmbedding: number[]) {
  const { data, error } = await supabaseClient.rpc("match_tags", {
    query_embedding: tagEmbedding,
    match_threshold: 0.7,
    match_count: 10,
  });
  if (error != null) {
    console.error("error invoking match_tags ", error);
  }
  return data;
}
