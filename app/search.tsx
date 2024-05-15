import {
  EmbeddingResult,
  getDatasetsInLocation,
  getTagEmbedding,
  match_tag,
  supabaseClient,
} from "@/clients/supabase";
import { USDatasetSource } from "@/components/index/EditTagButton";
import { cap } from "@/utils/util";

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
        data['location'] = data["location"];
        data['publisher'] = cap(data["publisher"]);
        data['topic'] = cap(data["topic"]);
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
  let [dataWithLoc, dataNoLoc] = data.reduce<[SearchResult[], SearchResult[]]>((acc, item) => {
    if (item.location.toLowerCase().includes(location.toLowerCase())) {
        acc[0].push(item);  // Matches condition, goes into the first array
    } else {
        acc[1].push(item); 
    }
    return acc;
}, [[], []]);
  dataWithLoc = scoreSearchResult(dataWithLoc, tags);
  dataNoLoc = scoreSearchResult(dataNoLoc, tags);
  return [...dataWithLoc, ...dataNoLoc];
}

export async function searchbarSearch(
  primaryTag: string,
  location: string,
  dsSource: USDatasetSource | null
): Promise<SearchResult[]> {
  if (primaryTag.toLowerCase() === 'all') {
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
