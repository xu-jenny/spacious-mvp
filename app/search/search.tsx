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
