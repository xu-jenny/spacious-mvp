import { createEmbedding } from "@/app/indexUtils";
import { SearchResult } from "@/app/search";
import { createClient } from "@supabase/supabase-js";
import { DataSource } from "../app/indexUtils";
import { USDatasetSource } from "@/components/index/SearchButton";
import { cap } from "@/utils/util";

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

export type EmbeddingResult = {
  id: number;
  content: string;
  similarity: number;
};

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
  length?: number | null;
};
export async function getDataset(
  dsMetadata: SearchResult
): Promise<Dataset | null> {
  // if (dsMetadata.dataset_source === "LASERFICHE"){
  //   return dsMetadata as Dataset
  // }
  let tablename = "US_USGS";
  switch (dsMetadata.dataset_source) {
    case "USGOV":
      tablename = "US_USGOV";
      break;
    case "NYOPEN":
      tablename = "US_nyopen";
      break;
    case "LASERFICHE":
      tablename = "US_laserfiche";
      break;
  }
  const { data, error } = await supabaseClient
    .from(tablename)
    .select("*")
    // .eq("id", dsMetadata.id);
    .eq("originalUrl", dsMetadata.originalUrl);
  if (error != null) {
    console.error("error fetching dataset id", dsMetadata.id, error);
    return null;
  }
  if (data == null) {
    return null;
  }
  return data[0];
}

export async function getDatasetsInLocation(
  location: string,
  dsSource: USDatasetSource | null
) {
  let query = supabaseClient
    .from("master")
    .select(
      "id, title, summary, location, topic, publisher, subtags, dataset_source, firstPublished, originalUrl"
    )
    .ilike("location", `%${location}%`);
  if (dsSource != null) {
    query = query.eq("dataset_source", dsSource);
  }
  const { data, error } = await query;
  if (data != null) {
    data.forEach((data) => {
      data["subtags"] = eval(data["subtags"]);
      data["location"] = data["location"];
      data["publisher"] = cap(data["publisher"]);
      data["topic"] = cap(data["topic"]);
    });
    console.log("getDatasetsInLocation data: ", data, "error:", error);
    return data;
  }
  return [];
}

// // for each tag, find all files that match using text_to_pages. in: tag, out: {fn1: [1, 3, 5], fn2: [2,4]}
// async function match_tag2page(
//   tag: string,
//   location: string
// ): Promise<Map<string, string[]> | null> {
//   // {fn: [1, 3, 5]}
//   const { data } = await supabaseClient
//     .from("pdf_text_index") // text, matches
//     .select("matches")  // [[camdenSq, [1,4,9]], [westVillage, [1, 8]]]
//     .ilike("location", `%${location}%`)
//     .eq("text", tag);
//   console.log(data); // matches should be [[fn, [1,3,5]], [fn2, [2,4]]
//   if (data && data.length > 0 && 'matches' in data && data['matches'] != null && data['matches'].length > 0) {
//     let results = new Map<string, string[]>();
//     data['matches'].forEach((d) => {
//       results.set(d[0] as string, JSON.parse(d[1]));
//     });
//     return results;
//   }
//   return null;
// }

// // for each tag, find all files that match using text_to_pages. in: tag, out: {fn1 : {score: 4.87, pages: [1, 3, 5]}}
// async function getSearchResults(
//   tag_scores: { content: string; similarity: number }[],
//   location: string
// ): Promise<Map<string, <number, string[]>[]> | null> {
//   let all_matches: Map<string, <number, string[]>[]> = new Map<
//     string,
//     <number, string[]>
//   >(); // fn: {score, [1, 3, 5, 7]. all matches for a file
//   for (const tag of tag_scores) {
//     let data: Map<string, string[]> | null = await match_tag2page(  // {fn: [1, 3, 5]}
//       tag["content"],
//       location
//     );
//     if (!data || data == null || data.size == 0) {
//       continue;
//     }
//     const currentTagScore = tag["similarity"];
//     // caluclate ranking scores
//     Object.entries(data).forEach((fn: string, f_pages: string[]) => {
//       if (fn in all_matches){
//         all_matches[fn].pages = Set(all_matches[fn].pages.extend(f_pages))
//         all_matches[fn].score = f_pages.length * currentTagScore
//       } else {
//         let titleMatchScore = tag['content'].includes(fn) ? 0.3 : 0
//         all_matches[fn] = {score: f_pages.length * currentTagScore + titleMatchScore, pages: f_pages}
//       }
//     });
//   }
//   if (all_matches.length > 0) {
//     return all_matches
//   }
//   return null;
// }

// async function semanticSearchLaserFiche(query: string, location: string): Promise<DatasetMetadata[] | null> {
//   let embedding = await getTagEmbedding(query);
//   if (embedding == null) return null;
//   let matchingTags = await match_tag(embedding);
//   if (matchingTags == null || matchingTags.length == 0) return null;
//   let searchResults = getSearchResults(matchingTags, location)  // fn: {score, [1, 3, 5, 7]} all matches for a file
//   if (searchResults == null) return null;
//   // query datasetMetadata
//   let filenames = searchResults.keys();
//   const { data: metadata, error } = await supabaseClient
//     .from("laserfiche")
//     .select("id, title, summary, location, topic, publisher, datasetUrl")
//     .in("title", filenames);
//   console.log(metadata)
//   if (metadata == null) return null;
//   let finalResults = metadata.map(d => {
//     const sResult = searchResults[d['title']]
//     return {...d, 'score': sResult['score'], 'pages': sResult['pages']}
//   })
//   return finalResults.sort((a, b) => a['score'] - b['score'])
// }
