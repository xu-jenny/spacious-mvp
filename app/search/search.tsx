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

export type LaserfichePageResult = {
  page: number;
  score: number;
  bbox: number[] | null;
}

export type LaserficheSearchResult = {
  title: string;
  id: string;
  nodes: LaserfichePageResult[];
  score: number;
  containsTable: boolean;
  originalUrl: string;
  page_bbox: number[] | null;
  firstPublished?: string | null;
  lastUpdated?: string | null;
  docDate?: string | null;
  facilityName?: string;
  owner?: string;
  metadata?: string;
};
type LaserficheHardcodeResult = {
  query: string;
  bestDocMatch: string;
  bestPageMatch: number;
  similarity: number;
  [key: string]: any; // Add this to allow dynamic indexing
}

async function laserficheHardcode(query: string, queryEmbed: Float32Array, location: string): Promise<LaserficheHardcodeResult[]> {
  console.log(query, location.toUpperCase(), queryEmbed.length)
  const vector = `[${queryEmbed.join(", ")}]`;
  const { data, error } = await supabaseClient.rpc("match_laserfiche_hardcode", {
    input_query: query,
    input_location: location.toUpperCase(),
    input_query_embedding: vector
  });
  if (error != null) {
    console.error(
      "error invoking match_laserfiche_hardcode",
      typeof vector,
      vector.length,
      error
    );
    return [];
  }
  // parse response to only include one LaserficheHardcodeResult per document
  const filteredData: LaserficheHardcodeResult[] = Object.values(data.reduce((acc: LaserficheHardcodeResult, current: LaserficheHardcodeResult) => {
    const key = `${current.bestDocMatch}-${current.bestPageMatch}`;

    // If the key doesn't exist or the current similarity is higher, update the object
    if (!acc[key] || current.similarity > acc[key].similarity) {
      acc[key] = current;
    }

    return acc;
  }, {})
  );
  return filteredData;
}

function transformLaserfichePageResults(pages: any, location: string): LaserfichePageResult[] {
  const nodes = pages.map((tuple: any[]) => {
    let pageBbox = null;
    try {
      if (location != '01005-97-032') {
        if (typeof tuple[2] == 'string') {
          pageBbox = JSON.parse(tuple[2])
        } else {
          pageBbox = tuple[2]
        }
      }
      return {
        'page': tuple[0],
        'score': tuple[1],
        'bbox': pageBbox
      }
    } catch (e) {
      console.error("Error parsing tuple", tuple, e);
    }
  })
  return nodes
}
function transformLaserficheSearchResult(d: { [x: string]: any; }, nodes: LaserfichePageResult[]): LaserficheSearchResult {
  let page_box = null;
  try {
    page_box = JSON.parse(d['page_bbox'])
  } catch (e) {
    console.error("Error parsing page_bbox", d['page_bbox'], e);
  }
  return {
    title: d['title'],
    id: d['id'],
    score: d['score'],
    page_bbox: page_box,
    containsTable: d['containsTable'],
    originalUrl: d['originalUrl'],
    "firstPublished": d["firstPublished"],
    "lastUpdated": d["lastUpdated"],
    "docDate": d["docDate"],
    "facilityName": d["facilityName"],
    "owner": d["owner"],
    "metadata": d["metadata"],
    nodes: nodes
  }
}

export async function laserficheSearch(
  query: string,
  location: string
): Promise<LaserficheSearchResult[]> {
  console.log("laserficheSearch", query, location);
  let embedding = await createGTEEmbedding(query)
  let hardcodeResults: LaserficheHardcodeResult[] = []
  if (embedding != null) {
    hardcodeResults = await laserficheHardcode(query, embedding, location)
    console.log("output of match_laserfiche_hardcode", hardcodeResults);
  }
  // let hardcodeResults = [{
  //   "query": "what are the historic uses on site? ",
  //   "bestDocMatch": "01005_Eakes_Drycleaners_BF_Site_Assmt",
  //   "bestPageMatch": 1,
  //   "similarity": 0.844034195128979
  // }]
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
  if (data != null && 'documents' in data && 'pages' in data) {
    let results: LaserficheSearchResult[] = [];
    data['documents'].forEach((d: { [x: string]: any; }) => {
      let pageMatch = data['pages'].filter((page_doc: { [x: string]: any; }) => page_doc['docid'] == d['id'])[0]
      if (pageMatch != null) {
        let nodes = transformLaserfichePageResults(pageMatch['pages'], location)
        let item = transformLaserficheSearchResult(d, nodes)
        if (hardcodeResults.length >= 1 && hardcodeResults[0].bestDocMatch == d['id']) {
          // find the corresponding node
          const correspondingNode = nodes.filter((node: LaserfichePageResult) => node.page == hardcodeResults[0].bestPageMatch)[0]
          item['nodes'].unshift(correspondingNode)
          item['score'] = 10
          hardcodeResults = []
        }
        // remove duplicate pages
        if (item['nodes'] != null && item['nodes'].length > 1) {
          const seen = new Set<number>();
          item['nodes'] = item['nodes'].filter((node: LaserfichePageResult) => {
            if (!seen.has(node.page)) {
              seen.add(node.page);
              return true;
            }
            return false;
          });
        }
        results.push(item)
      }
    });
    // add hardcode result to results
    if (hardcodeResults.length > 0) {
      // we know this already doesn't exist inresults, a hack above sets it to []
      // this could be because there was no pageMatch returned
      const foundDoc = data['documents'].find((d: { [x: string]: any; }) => d['id'] === hardcodeResults[0].bestDocMatch)
      let nodes = [{ 'page': hardcodeResults[0].bestPageMatch, 'score': 10, 'bbox': null }]
      if (hardcodeResults[0]['query'].includes("assumed groundwater impacts")) {
        nodes = [{ 'page': 2, 'score': 10, 'bbox': null }, { 'page': 3, 'score': 9, 'bbox': null }, { 'page': 4, 'score': 8, 'bbox': null }, { 'page': 10, 'score': 7, 'bbox': null }]
      } else if (hardcodeResults[0]['query'].includes("underground storage tank")) {
        nodes = [{ 'page': 2, 'score': 10, 'bbox': null }, { 'page': 3, 'score': 9, 'bbox': null }]
      } else if (hardcodeResults[0]['query'].includes("historic use")) {
        nodes = [{ 'page': 1, 'score': 10, 'bbox': null }, { 'page': 14, 'score': 9, 'bbox': null }]
      }
      results.push({
        title: foundDoc['title'],
        id: foundDoc['id'],
        score: 10,
        page_bbox: null,
        containsTable: foundDoc['containsTable'],
        originalUrl: foundDoc['originalUrl'],
        "firstPublished": foundDoc["firstPublished"],
        "lastUpdated": foundDoc["lastUpdated"],
        "docDate": foundDoc["docDate"],
        "facilityName": foundDoc["facilityName"],
        "owner": foundDoc["owner"],
        "metadata": foundDoc["metadata"],
        nodes: nodes
      })

    }
    console.log(results)
    return results.sort((a, b) => b.score - a.score);
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
