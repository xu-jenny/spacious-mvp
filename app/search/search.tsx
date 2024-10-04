import {
  EmbeddingResult,
  getDatasetsInLocation,
  getTagEmbedding,
  match_tag,
  supabaseClient,
} from "@/clients/supabase";
import { USDatasetSource } from "@/components/index/SearchButton";
import { post } from "@/utils/http";
import { cap } from "@/utils/util";
import { createGTEEmbedding } from "./indexUtils";

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
    // query = query.ilike(`location`, `%united states%`);
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
  node_id: string;
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
  nodes?: PFASNodeResult[];
  firstPublished?: string | null;
  summary?: string;
  publisher?: string;
  context_summary?: string;
  originalUrl: string;
  lastUpdated?: string | null;
};

export type USGSWaterSearchResult = {
  title: string;
  id: string;
  siteId: string;
  summary: string;
  lat: number;
  long: number;
  distanceFromInput: number;
  dataTypes: string;
  county: string | null;
  stateCode: string | null;
  matchingParamCode: string[];
  csv_dl_link?: string;
  unit?: string | null;
  sample_df?: {
    datetime: string;
    value: number;
  }[];
};

async function queryPFASNodes(
  query: string,
  queryEmbed: number[],
  ref_doc_ids: string[]
): Promise<PFASNodeResult[] | null> {
  // let response = await post(
  // `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/query_nodes`,
  // {
  // query_str: query,
  // query_embedding: queryEmbed,
  // ref_doc_ids: ref_doc_ids,
  // }
  // );
  let response = await post(
    `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/query_nodes`,
    JSON.stringify({
      query_str: query,
      query_embedding: queryEmbed,
      ref_doc_ids: ref_doc_ids,
    }),
  )
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });
  if (response != null) {
    return JSON.parse(response);
  }
  return response;
}

export type LaserficheSearchResult = {
  title: string;
  id: string;
  nodes: number[];
  score: number;
  containsTable: boolean;
  originalUrl: string;
  firstPublished?: string | null;
  lastUpdated?: string | null;
  docDate?: string | null;
  facilityName?: string;
  owner?: string;
  metadata?: string;
};

export async function laserficheSearch(
  query: string,
  location: string
): Promise<LaserficheSearchResult[]> {
  console.log("laserficheSearch", query, location);
  let response = await post(
    `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/laserfiche`,
    {
      query: query,
      location: location,
    }
  );
  if (response == null) {
    return [];
  }
  const data = JSON.parse(response);
  console.log(data)
  if (data != null && 'documents' in data && 'pages' in data){
    let results: LaserficheSearchResult[] = [];
    data['documents'].forEach((d: { [x: string]: any; }) => {
      let pageMatch = data['pages'].filter((page_doc: { [x: string]: any; }) => page_doc['docid'] == d['id'])[0]
      let item = {
        title: d['title'],
        id: d['id'],
        score: d['score'],
        containsTable: d['containsTable'],
        originalUrl: d['originalUrl'],
        "firstPublished": d["firstPublished"],
        "lastUpdated": d["lastUpdated"],
        "docDate": d["docDate"],
        "facilityName": d["facilityName"],
        "owner": d["owner"],
        "metadata": d["metadata"],
        nodes: pageMatch['pages'].map((tuple: any[]) => tuple[0])
      }
      results.push(item)
    });
    console.log(results)
    return results.sort((a, b) => b.score - a.score);
  }
  return [];
}

export async function pfasSearch(
  query: string,
  location: string
): Promise<PFASSearchResult[]> {
  // create embedding
  let embedding = await createGTEEmbedding(query.toLowerCase());
  if (embedding == null) return [];
  let embeddingArr = Array.from(embedding);
  let docs = await queryPFASDocs(query, embeddingArr);
  let ref_doc_ids = docs?.map((doc) => doc["ref_doc_id"]);
  console.log("fetched ref_doc_ids from queryPFASDocs", ref_doc_ids);
  let nodes = await queryPFASNodes(query, embeddingArr, ref_doc_ids ?? []);
  console.log("fetched nodes from queryPFASNodes", nodes);
  // each doc should have a nodes array
  let doc_to_nodes = new Map();
  nodes?.forEach((n: PFASNodeResult) => {
    if (doc_to_nodes.has(n.ref_doc_id)) {
      let new_nodes = doc_to_nodes.get(n.ref_doc_id);
      new_nodes.push(n);
      doc_to_nodes.set(n.ref_doc_id, new_nodes);
    } else {
      doc_to_nodes.set(n.ref_doc_id, [n]);
    }
  });
  console.log("PFAS nodes result: ", doc_to_nodes);
  // map docs to PFAS Search Result
  let results: PFASSearchResult[] = [];
  docs?.forEach((doc) => {
    let result: PFASSearchResult = {
      title: doc["title"] ?? doc["ref_doc_id"],
      id: doc["ref_doc_id"],
      publisher: doc["publisher"],
      summary: doc["document_summary"],
      context_summary: doc["context_summary"],
      originalUrl: doc["originalUrl"],
      nodes: doc_to_nodes.get(doc.ref_doc_id) ?? [],
    };
    results.push(result);
  });
  if (results != null && results.length > 0) {
    // sort by nodes length
    // @ts-ignore
    results.sort((a, b) => b.nodes.length - a.nodes.length);
    return results;
  }
  return [];
}

function round(num: number, fractionDigits: number): number {
  return Number(num.toFixed(fractionDigits));
}

export async function usgsWaterSearch(
  keyword: string,
  location: string,
  startTime: string,
  endTime: string
): Promise<USGSWaterSearchResult[]> {
  console.log("location: ", location);
  console.log("keyword: ", keyword);
  let response = await post(
    `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/usgs_water`,
    {
      location,
      startTime,
      endTime,
      keyword,
    }
  );
  console.log(response)
  if (!response || !response.rows) {
    console.error("Unexpected response structure:", response);
    return [];
  }
  let rows = response.rows;
  if (rows == null || rows.length == 0) {
    return [];
  }
  let sample_df = response.sample;
  let dl_link = `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/download-csv/${response.csv_id}`;

  let data: USGSWaterSearchResult[] = [];
  rows.forEach((row: { [x: string]: any }, i: number) => {
    let result: USGSWaterSearchResult = {
      id: row["iotid"],
      title: row["locationname"],
      distanceFromInput: round(row["distance"] / 1600, 2),
      summary: "",
      lat: row["lat"],
      long: row["long"],
      dataTypes: "",
      county: row["county"],
      stateCode: row["statecode"],
      siteId: "",
      matchingParamCode: [],
    };
    result["summary"] = `This is a ${row["datatype"]
      } Station, it's located at ${row["locationname"]} (${round(
        row["lat"],
        4
      )}, ${round(row["long"], 4)}).`;
    result["siteId"] = result["id"].slice(5);
    const cleanedString = row["paramcodes"].slice(1, -1);
    const tupleStrings = cleanedString.split("), ("); // Split by "), ("

    tupleStrings.map((tupleStr: string) => {
      const cleanedTuple = tupleStr.replace(/[\(\)]/g, ""); // Remove any remaining parentheses
      const [first, second] = cleanedTuple
        .split("', '")
        .map((item) => item.replace(/^'|'$/g, "").trim()); // Split and remove quotes
      if (first.toLowerCase().includes(keyword.toLowerCase())) {
        result["matchingParamCode"] = [first, second];
      }
      return [first, second];
    });

    try {
      const tuples =
        row["paramcodes"]
          .match(/\('(.*?)', '.*?'\)/g)
          ?.map((tupleStr: string) => {
            const match = tupleStr.match(/\('(.*?)', '.*?'\)/);
            return match ? match[1] : "";
          }) || [];
      // find unit
      const processedSegments = tuples.map((segment: string) => {
        const parts = segment.split(", ");
        if (parts.length > 1) {
          const firstPart = parts[0];
          const remainingParts = parts.slice(1).join(", ");
          if (i == 0 && segment.toLowerCase().includes(keyword.toLowerCase())) {
            result["unit"] = `${firstPart} (${remainingParts})`;
          }
          return `${firstPart} (${remainingParts})`;
        }
        return segment;
      });
      result["dataTypes"] = processedSegments.join(" | ");
      result["summary"] +=
        ` \n\nAvailable data at station: ${result["dataTypes"]}`;
    } catch {
      console.log("error parsing paramCodes", row);
    }
    if (i == 0) {
      result["csv_dl_link"] = dl_link;
      result["sample_df"] = sample_df;
    }
    data.push(result);
  });
  console.log(data);
  return data;
}

export async function searchbarSearch(
  primaryTag: string,
  location: string,
  dsSource: USDatasetSource | null
): Promise<SearchResult[] | USGSWaterSearchResult[]> {
  if (primaryTag.toLowerCase() === "all") {
    return getDatasetsInLocation(location, dsSource);
  }
  let filteredData = await semanticFilter(primaryTag, location, dsSource);
  if (filteredData == null) {
    return [];
  }
  const [data, tags] = filteredData;
  const rankedData = semanticRank(data, tags, location);
  return Array.from(new Set(rankedData));
}
