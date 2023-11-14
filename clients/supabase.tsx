import { DatasetMetadata } from "@/components/MetadataTable";
import { createClient } from "@supabase/supabase-js";
// import dotenv from "dotenv";
// dotenv.config();
// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || ""
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
