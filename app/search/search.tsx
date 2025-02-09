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
// import { createGTEEmbedding } from "./indexUtils";
// import { EventSourcePolyfill } from "event-source-polyfill";
import { useChat } from "ai/react";

export type GenericSearchResult = {
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
): Promise<[GenericSearchResult[], EmbeddingResult[]] | null> {
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
  data: GenericSearchResult[],
  tags: EmbeddingResult[]
): GenericSearchResult[] {
  const scoredData = data.map((d: GenericSearchResult) => {
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
  data: GenericSearchResult[],
  tags: EmbeddingResult[],
  location: string
) {
  location = location.toLowerCase();
  let [dataWithLoc, dataNoLoc] = data.reduce<
    [GenericSearchResult[], GenericSearchResult[]]
  >(
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

export type LaserfichePageResult = {
  page: number;
  score: number;
  bbox: number[] | null;
  text: string;
};

export type LaserficheSearchResult = {
  title: string;
  id: string;
  nodes: LaserfichePageResult[];
  score: number;
  text: string;
  containsTable: boolean;
  originalUrl: string;
  page_bbox: number[] | null;
  images?: string[] | null;
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
};

async function laserficheHardcode(
  query: string,
  queryEmbed: Float32Array,
  location: string
): Promise<LaserficheHardcodeResult[]> {
  console.log(query, location.toUpperCase(), queryEmbed.length);
  const vector = `[${queryEmbed.join(", ")}]`;
  const { data, error } = await supabaseClient.rpc(
    "match_laserfiche_hardcode",
    {
      input_query: query,
      input_location: location.toUpperCase(),
      input_query_embedding: vector,
    }
  );
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
  const filteredData: LaserficheHardcodeResult[] = Object.values(
    data.reduce(
      (acc: LaserficheHardcodeResult, current: LaserficheHardcodeResult) => {
        const key = `${current.bestDocMatch}-${current.bestPageMatch}`;

        // If the key doesn't exist or the current similarity is higher, update the object
        if (!acc[key] || current.similarity > acc[key].similarity) {
          acc[key] = current;
        }

        return acc;
      },
      {}
    )
  );
  return filteredData;
}

function transformLaserfichePageResults(
  pages: any,
  location: string
): LaserfichePageResult[] {
  const nodes = pages.map((tuple: any[]) => {
    // page, score, bbox, text
    let pageBbox = null;
    try {
      if (location != "01005-97-032") {
        if (typeof tuple[2] == "string") {
          pageBbox = JSON.parse(tuple[2]);
        } else {
          pageBbox = tuple[2];
        }
      }
      return {
        page: tuple[0],
        score: tuple[1],
        bbox: pageBbox,
        text: tuple[3] ?? "",
      };
    } catch (e) {
      console.error("Error parsing tuple", tuple, e);
    }
  });
  return nodes;
}
function transformLaserficheSearchResult(
  d: { [x: string]: any },
  nodes: LaserfichePageResult[]
): LaserficheSearchResult {
  let page_box = null;
  try {
    page_box = JSON.parse(d["page_bbox"]);
  } catch (e) {
    console.error("Error parsing page_bbox", d["page_bbox"], e);
  }
  return {
    title: d["title"],
    id: d["id"],
    score: d["score"],
    page_bbox: page_box,
    text: d["text"] ?? "",
    containsTable: d["containsTable"],
    originalUrl: d["originalUrl"],
    firstPublished: d["firstPublished"],
    lastUpdated: d["lastUpdated"],
    docDate: d["docDate"],
    facilityName: d["facilityName"],
    owner: d["owner"],
    metadata: d["metadata"],
    nodes: nodes,
  };
}

export async function laserficheFilter(
  location: string,
  role: number = 0,
  filterImage: boolean = false
): Promise<LaserficheSearchResult[]> {
  console.log("laserficheFilter", location, filterImage, role);
  let response = [];
  if (filterImage == true) {
    response = await post(
      `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/laserfiche-images`,
      {
        location: location,
        role: role,
      }
    );
  } else {
    response = await post(
      `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/laserfiche-all`,
      {
        location: location,
        role: role,
      }
    );
  }
  if (response == null) {
    return [];
  }
  let data = JSON.parse(response);
  if (data != null && data.length > 0) {
    let results: LaserficheSearchResult[] = data.map(
      (d: { [x: string]: any }, idx: number) => {
        let page_box = null;
        let images = null;
        try {
          if (d["page_bbox"] != null) {
            page_box = JSON.parse(d["page_bbox"].replace(/'/g, '"'));
          }
          if (d["images"] != null) {
            images = JSON.parse(d["images"].replace(/'/g, '"'));
          }
        } catch (e) {
          console.error("Error parsing page_bbox", d["page_bbox"], e);
        }
        return {
          title: d["title"],
          id: d["id"],
          score: data.length - idx,
          page_bbox: page_box,
          containsTable: false,
          images: images,
          originalUrl: d["originalUrl"],
          firstPublished: d["firstPublished"],
          lastUpdated: d["lastUpdated"],
          docDate: d["docDate"],
          facilityName: d["facilityName"],
          owner: d["owner"],
          metadata: d["metadata"],
          nodes: [],
        };
      }
    );
    return results;
  }
  return data;
}

export async function laserficheSearch(
  query: string,
  location: string
): Promise<LaserficheSearchResult[]> {
  console.log("laserficheSearch", query, location);
  // let embedding = await createGTEEmbedding(query);
  // let hardcodeResults: LaserficheHardcodeResult[] = [];
  // if (embedding != null) {
  //   hardcodeResults = await laserficheHardcode(query, embedding, location);
  //   console.log("output of match_laserfiche_hardcode", hardcodeResults);
  // }
  // let response = await post(
  //   `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/laserfiche`,
  //   {
  //     query: query,
  //     location: location,
  //   }
  // );

  const params = new URLSearchParams({
    query: query,
    location: location,
  });

  const url = `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/laserfiche?${params.toString()}`;
  console.log("EventSource URL:", url);
  // const eventSource = new EventSourcePolyfill(url, {
  //   headers: {
  //     "x-api-key": process.env.NEXT_PUBLIC_BACKEND_API_KEY ?? "",
  //   },
  // });

  // eventSource.onmessage = (event: any) => {
  //   console.log("eventSource message");
  //   const data = JSON.parse(event.data);

  //   if (data.type === "docs") {
  //     console.log("Got documents:", data.content);
  //     // Handle documents
  //   } else if (data.type === "token") {
  //     console.log("Got token:", data.content);
  //     // Append token to your UI
  //   }
  // };

  // eventSource.onerror = (error: any) => {
  //   console.error("EventSource failed:", error);
  //   eventSource.close();
  // };

  return [];

  // const reader = response.body.getReader();
  // const decoder = new TextDecoder();

  // while (true) {
  //   const { value, done } = await reader.read();
  //   if (done) break;

  //   const chunk = decoder.decode(value);
  //   const messages = chunk.split("\\n\\n");

  //   for (const message of messages) {
  //     if (message.startsWith("data: ")) {
  //       const data = JSON.parse(message.slice(6));

  //       if (data.type === "documents") {
  //         console.log("Received documents:", data.docs);
  //         console.log("Received nodes:", data.nodes);
  //         let results: LaserficheSearchResult[] = [];
  //         if (
  //           data != null &&
  //           data != undefined &&
  //           "documents" in data &&
  //           "pages" in data
  //         ) {
  //           data["documents"].forEach((d: { [x: string]: any }) => {
  //             let pageMatch = data["pages"].filter(
  //               (page_doc: { [x: string]: any }) => page_doc["docid"] == d["id"]
  //             )[0];
  //             if (pageMatch != null) {
  //               let nodes = transformLaserfichePageResults(
  //                 pageMatch["pages"],
  //                 location
  //               );
  //               let item = transformLaserficheSearchResult(d, nodes);
  //               if (item["nodes"] != null && item["nodes"].length > 1) {
  //                 const seen = new Set<number>();
  //                 item["nodes"] = item["nodes"].filter(
  //                   (node: LaserfichePageResult) => {
  //                     if (node == null || !("page" in node)) {
  //                       return false;
  //                     }
  //                     if (!seen.has(node.page)) {
  //                       seen.add(node.page);
  //                       return true;
  //                     }
  //                     return false;
  //                   }
  //                 );
  //               }
  //               results.push(item);
  //             }
  //           });
  //           return results.sort((a, b) => b.score - a.score);
  //         }
  //       } else if (data.type === "token") {
  //         console.log("Received token:", data.content);
  //         // Append to your UI here
  //       }
  //     }
  //   }
  // }

  if (response == null) {
    return [];
  }
  // const data = JSON.parse(response);
  // let results: LaserficheSearchResult[] = [];
  // if (
  //   data != null &&
  //   data != undefined &&
  //   "documents" in data &&
  //   "pages" in data
  // ) {
  //   data["documents"].forEach((d: { [x: string]: any }) => {
  //     let pageMatch = data["pages"].filter(
  //       (page_doc: { [x: string]: any }) => page_doc["docid"] == d["id"]
  //     )[0];
  //     if (pageMatch != null) {
  //       let nodes = transformLaserfichePageResults(
  //         pageMatch["pages"],
  //         location
  //       );
  //       let item = transformLaserficheSearchResult(d, nodes);
  //       // if (
  //       //   hardcodeResults.length >= 1 &&
  //       //   hardcodeResults[0].bestDocMatch == d["id"]
  //       // ) {
  //       //   // find the corresponding node
  //       //   const correspondingNode = nodes.filter(
  //       //     (node: LaserfichePageResult) =>
  //       //       node.page == hardcodeResults[0].bestPageMatch
  //       //   )[0];
  //       //   item["nodes"].unshift(correspondingNode);
  //       //   item["score"] = 10;
  //       //   hardcodeResults = [];
  //       // }
  //       // remove duplicate pages
  //       if (item["nodes"] != null && item["nodes"].length > 1) {
  //         const seen = new Set<number>();
  //         item["nodes"] = item["nodes"].filter((node: LaserfichePageResult) => {
  //           if (node == null || !("page" in node)) {
  //             return false;
  //           }
  //           if (!seen.has(node.page)) {
  //             seen.add(node.page);
  //             return true;
  //           }
  //           return false;
  //         });
  //       }
  //       results.push(item);
  //     }
  //   });
  //   // if (hardcodeResults.length > 0) {
  //   //   console.log(
  //   //     "Did not find hardcode doc from backend result, this should not Show up"
  //   //   );
  //   //   // if hardcodeResults is already added, it will be []. otherwise it was not incldued in the retunred result so adding now
  //   //   const foundDoc = data["documents"].find(
  //   //     (d: { [x: string]: any }) => d["id"] === hardcodeResults[0].bestDocMatch
  //   //   );
  //   //   let nodes = [
  //   //     {
  //   //       page: hardcodeResults[0].bestPageMatch,
  //   //       score: 10,
  //   //       bbox: null,
  //   //       text: "",
  //   //     },
  //   //   ];

  //   //   results.push({
  //   //     title: foundDoc["title"],
  //   //     id: foundDoc["id"],
  //   //     score: 10,
  //   //     text: foundDoc["text"] ?? "",
  //   //     page_bbox: null,
  //   //     containsTable: foundDoc["containsTable"],
  //   //     originalUrl: foundDoc["originalUrl"],
  //   //     firstPublished: foundDoc["firstPublished"],
  //   //     lastUpdated: foundDoc["lastUpdated"],
  //   //     docDate: foundDoc["docDate"],
  //   //     facilityName: foundDoc["facilityName"],
  //   //     owner: foundDoc["owner"],
  //   //     metadata: foundDoc["metadata"],
  //   //     nodes: nodes,
  //   //   });
  //   // }
  //   console.log(results);
  //   return results.sort((a, b) => b.score - a.score);
  // }
  return [];
}
