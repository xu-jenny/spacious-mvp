import { createEmbedding } from "@/app/indexUtils";
import { DatasetMetadata } from "@/components/MetadataTable";
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

export async function match_tag(
  tagEmbedding: string
): Promise<{ id: number; content: string; similarity: number }[] | null> {
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

