import {
  EmbeddingResult,
  getDatasetsInLocation,
  getTagEmbedding,
  match_tag,
  supabaseClient,
} from "@/clients/supabase";
import { USDatasetSource } from "@/components/index/EditTagButton";
import { post } from "@/utils/http";
import { cap } from "@/utils/util";
import { createEmbedding } from "./indexUtils";

export type SearchResult = {
  id: string;
  title: string;
  summary: string;
  publisher: string;
  location: string;
  topic: string;
  dataset_source: string;
  firstPublished?: string | null;
  // lastUpdated: string;
  originalUrl: string;
  subtags: string[];
  score?: number;
};

async function semanticFilter(
  tag: string,
  location: string,
  dsSource: USDatasetSource | null
): Promise<[SearchResult[], EmbeddingResult[]] | null> {
  let embedding = await getTagEmbedding(tag.toLowerCase());
  if (embedding == null) return null;
  // call semantic search function on supabase
  let matchingTags = await match_tag(embedding);
  if (matchingTags == null) {
    matchingTags = [{ id: 0, content: tag, similarity: 1 }];
  } else {
    matchingTags.push({ id: 0, content: tag, similarity: 1 });
  }
  if (matchingTags != null && matchingTags.length > 0) {
    let tags = matchingTags.map((tag) => tag.content);
    let query = supabaseClient
      .from("master")
      .select(
        "id, title, summary, location, topic, publisher, subtags, dataset_source, firstPublished, originalUrl"
      )
      .containedBy("topic", tags)
      .or(`topic.ilike.%${tag}%,title.ilike.%${tag}%,subtags.ilike.%${tag}%`);
    if (location != "United States") {
      query = query.or(
        `location.ilike.%${location}%,location.ilike.%United States%`
      );
    }
    // else {
    //   query = query.ilike(`location`, `%united states%`);
    // }
    if (dsSource != null) {
      query = query.eq("dataset_source", dsSource);
    }
    console.log(query);
    const { data, error } = await query;
    if (data != null) {
      data.forEach((data) => {
        data["subtags"] = eval(data["subtags"]);
        data["location"] = data["location"];
        data["publisher"] = cap(data["publisher"]);
        data["topic"] = cap(data["topic"]);
      });
      console.log("semantic filter data: ", data, "error:", error);
      return [data, matchingTags];
    }
  }
  return null;
}

function scoreSearchResult(
  data: SearchResult[],
  tags: EmbeddingResult[]
): SearchResult[] {
  const scoredData = data.map((d: SearchResult) => {
    let score = 0;
    const topicTag = tags.find((tag) => tag.content === d.topic);
    if (topicTag) {
      score += topicTag.similarity;
    }
    if ("subtags" in d && d.subtags != null && d.subtags.length > 0) {
      d.subtags.forEach((subtag) => {
        const subtagMatch = tags.find((tag) => tag.content === subtag);
        if (subtagMatch) {
          score += 0.1 * subtagMatch.similarity;
        }
      });
    }
    d["score"] = score;
    return d;
  });
  return scoredData.sort((a, b) => b.score ?? 0 - (a.score ?? 0));
}

function semanticRank(
  data: SearchResult[],
  tags: EmbeddingResult[],
  location: string
) {
  location = location.toLowerCase();
  let [dataWithLoc, dataNoLoc] = data.reduce<[SearchResult[], SearchResult[]]>(
    (acc, item) => {
      if (item.location.toLowerCase().includes(location.toLowerCase())) {
        acc[0].push(item); // Matches condition, goes into the first array
      } else {
        acc[1].push(item);
      }
      return acc;
    },
    [[], []]
  );
  dataWithLoc = scoreSearchResult(dataWithLoc, tags);
  dataNoLoc = scoreSearchResult(dataNoLoc, tags);
  return [...dataWithLoc, ...dataNoLoc];
}

export type PFASDocsResult = {
  ref_doc_id: string;
  title: string;
  document_summary: string;
  context_summary: string;
  publisher: string;
  originalUrl: string;
  firstPublished?: string | null;
  lastUpdated?: string | null;
};
export type PFASNodeResult = {
  node_type: string;
  content: string;
  ref_doc_id: string;
  similarity: number;
};

async function queryPFASDocs(
  query: string,
  queryEmbed: number[]
): Promise<PFASDocsResult[] | null> {
  let response = await post(
    `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/query_docs`,
    {
      query_str: query,
      query_embedding: queryEmbed,
    }
  );
  console.log(JSON.parse(response));
  return JSON.parse(response);
}

export type PFASSearchResult = {
  title: string;
  id: string;
  summary: string;
  publisher: string;
  context_summary: string;
  originalUrl: string;
  nodes: PFASNodeResult[];
  firstPublished?: string | null;
  lastUpdated?: string | null;
};

async function queryPFASNodes(
  query: string,
  queryEmbed: number[],
  ref_doc_ids: string[]
): Promise<PFASNodeResult[] | null> {
  // let response = await post(
  //   `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/query_nodes`,
  //   {
  //     query_str: query,
  //     query_embedding: queryEmbed,
  //     ref_doc_ids: ref_doc_ids,
  //   }
  // );
  let response = await fetch(
    `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/query_nodes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        query_str: query,
        query_embedding: queryEmbed,
        ref_doc_ids: ref_doc_ids,
      }),
    }
  )
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });
  if (response != null) {
    console.log(JSON.parse(response));
    return JSON.parse(response);
  }
  return response;
}

export async function pfasSearch(query: string): Promise<PFASSearchResult[]> {
  // @ts-ignore
  // let embedding: Float32Array = await getTagEmbedding(
  //   query.toLowerCase(),
  //   true
  // );
  let embedding = await createEmbedding(query.toLowerCase());
  if (embedding == null) return [];

  let embeddingArr = Array.from(embedding);
  let docs = await queryPFASDocs(query, embeddingArr);
  let ref_doc_ids = docs?.map((doc) => doc["ref_doc_id"]);
  console.log(ref_doc_ids);
  let nodes = await queryPFASNodes(query, embeddingArr, ref_doc_ids ?? []);
  let doc_to_nodes = new Map();
  nodes?.forEach((n: PFASNodeResult) => {
    if (n.ref_doc_id in doc_to_nodes) {
      let new_nodes = doc_to_nodes.get(n.ref_doc_id).push(n);
      console.log(new_nodes);
      doc_to_nodes.set(n.ref_doc_id, new_nodes);
    } else {
      doc_to_nodes.set(n.ref_doc_id, [n]);
    }
  });
  console.log(doc_to_nodes);
  let results: PFASSearchResult[] = [];
  docs?.forEach((doc) => {
    let result: PFASSearchResult = {
      title: doc["title"],
      id: doc["ref_doc_id"],
      publisher: doc["publisher"],
      summary: doc["document_summary"],
      context_summary: doc["context_summary"],
      originalUrl: doc["originalUrl"],
      nodes: doc_to_nodes.get(doc.ref_doc_id) ?? [],
    };
    results.push(result);
  });
  console.log(results);
  if (results != null && results.length > 0) {
    return results;
  }
  return [];
}

export async function searchbarSearch(
  primaryTag: string,
  location: string,
  dsSource: USDatasetSource | null
): Promise<SearchResult[] | PFASSearchResult[]> {
  if (primaryTag.toLowerCase() === "all") {
    return getDatasetsInLocation(location, dsSource);
  }
  if (dsSource == "PFAS") {
    return pfasSearch(primaryTag);
  }
  let filteredData = await semanticFilter(primaryTag, location, dsSource);
  if (filteredData == null) {
    return [];
  }
  const [data, tags] = filteredData;
  const rankedData = semanticRank(data, tags, location);
  return Array.from(new Set(rankedData));
}
