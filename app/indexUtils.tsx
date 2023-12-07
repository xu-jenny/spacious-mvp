import { primary_tag_fts, tangential_tag_fts } from "./api/keyword/utils";
import { getIntersectPlaces } from "./api/location/utils";
import { addressToCoord } from "./api/location/utils";

export interface IFormInput {
  address?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  message: string;
}

export async function parseLocationFormInput(
  data: IFormInput
): Promise<string[] | null> {
  let interestedLocations = null;
  if (data["latitude"] && data["longitude"]) {
    let locations = await getIntersectPlaces(
      { lat: data["latitude"], lon: data["longitude"] },
      data["radius"]
    );
    interestedLocations = locations;
  } else if (data["address"]) {
    let coords = await addressToCoord(data.address);
    if (coords != null) {
      let locations = await getIntersectPlaces(coords, data["radius"]);
      interestedLocations = locations;
    }
  } else if (data["region"]) {
    let stateMap = {
      Victoria: "VIC",
      "Western australia": "WA",
      "New south wales": "NSW",
      Queensland: "QLD",
      Tasmaina: "TAS",
    };
    if (data["region"] in stateMap) {
      // @ts-ignore
      interestedLocations = [stateMap[data["region"]]];
    } else {
      interestedLocations = [data["region"]];
    }
  }
  return interestedLocations;
}

export async function getSupabaseData(
  tags: { primary_tag?: string; tangential_tags?: string },
  locations: string
): Promise<{ primaryData: any[] | null; tangentialData: any[] | null }> {
  if (tags != null && "primary_tag" in tags && tags["primary_tag"] != null) {
    console.log(
      `Calling supabase Query with params primaryTag: ${tags["primary_tag"]}, tangentialTag: ${tags["tangential_tags"]}, Locations: ${locations}`
    );
    let primaryData = await primary_tag_fts(tags["primary_tag"], locations);
    let tangentialData = null;
    console.log("tangential data search condition ", "tangential_tags" in tags && tags["tangential_tags"] != null)
    if ("tangential_tags" in tags && tags["tangential_tags"] != null) {
      tangentialData = await tangential_tag_fts(
        tags["tangential_tags"].toLowerCase().replaceAll(", ", ","),
        locations
      );
    }
    return {
      primaryData, //: result["primarytagData"],
      tangentialData, //: result["tangentialTagData"],
    };
  } else {
    return {
      primaryData: null,
      tangentialData: null,
    };
  }
}
