import { openaiChat } from "@/clients/openai";
import { invokeSupabaseFunction, supabaseClient } from "@/clients/supabase";

function parseRelevantTagsResponse(inputString: string) {
  var parts = inputString.toLowerCase().split("primary:");
  if (parts.length !== 2) {
    // Handle the case where "Primary:" is not found in the input string
    console.error("Error: 'Primary:' not found in the input string");
    return null;
  } else {
    var tangentialParts = parts[1].toLowerCase().split("tangential:");
    var primaryTag = parts[1].toLowerCase().split("tangential:")[0].trim();
    if (tangentialParts.length < 1) {
      console.error("Error: 'Tangential:' not found in the input string");
      return { primaryTag };
    } else {
      var tangentialTags = tangentialParts[1]
        .trim()
        .split(",")
        .map((tag) => tag.trim());
      return { primaryTag, tangentialTags };
    }
  }
}

export async function relevantTags(query: string) {
  let response = await openaiChat(TAG_GROUP_PROMPT, query);
  console.log("openai TAG Response: ", response);
  // let response =
  //   "Primary: PFAS\n" +
  //   "Tangential: water quality, soil properties, groundwater flow";
  return parseRelevantTagsResponse(response!);
}

export async function relevantTagsWithoutParsing(query: string) {
  let response = await openaiChat(TAG_GROUP_PROMPT, query);
  console.log("openai TAG Response: ", response);
  return response;
}

export async function tangential_tag_fts(queries: string, locations: string) {
  const { data, error } = await supabaseClient.rpc("tangential_tag_fts", {
    queries, //: "water quality,soil type,land use",
    locations, // : "Melbourne,Syndney",
  });
  if (error != null) {
    console.error("error invoking tangential_tag_fts ", error);
  }
  return data;
}

export async function primary_tag_fts(query: string, locations: string) {
  const { data, error } = await supabaseClient.rpc("tag_title_fts", {
    query, //: "land use",
    locations, //: "Melbourne,Syndney,NSW",
  });
  if (error != null) {
    console.error("error invoking tangential_tag_fts ", error);
  }
  return data;
}

export const TAG_GROUP_PROMPT = `Your role is an environmental scientist. Based on a query, your objective is to identify:
A primary dataset tag that directly relates to the central question.
Tangential dataset tags that supplement the primary tag by providing additional context or information.

Draw from your subject matter expertise as an environmental scientist to identify the most relevant tags.

Reference Tags (use the following tags or create a new one if necessary): 
[acid sulfate soils, administrative boundaries, air quality, biodiversity, bridge network, child safety, climate, climate modeling, elevation, education, electoral boundaries, fiber optic infrastructure, flood mapping, flood study, geologic formations, geological map, geochemical grid, geoscape administrative boundaries, geophysical features, governance, gravity data, heavy vehicle routes, land suitability, land use, land use planning, land use potential, oceanography, PFAS, potassium concentration, remote sensing, road network, soil, soil landscape, soil properties, soil rootzone depth, soil type, topography, transportation, transportation infrastructure, transportation network, uranium concentration, urban facilities, urban forestry, urban infrastructure, urban planning, vegetation, vegetation cover, vegetation mapping, waste management, water quality, wetlands].

Guidelines:
1. Primary Tag: Directly relates to the central question.
2. Tangential Tags: Provide peripheral information or context.

Examples:
Question: There is PFAS contamination at Lake George. What waterways may have been impacted?
Primary: PFAS
Tangential: Watershed, Stream map, Topography, Hydrologic soil group, Land use, Groundwater flow, Groundwater wells
Reasoning: The primary concern is PFAS contamination, so PFAS is the primary tag. To find waterways that may have been impacted, Watershed and Stream maps can be helpful. It may also be interesting to know the waterway flow path and direction, which Topography data can help find. It can also help to determine infiltration into soil, which can be referenced from Hydrologic soil groups. Groundwater data can be used to know where the PFAS plume is going to.

Question: PFAS was detected in a well used for drinking water. How many other people may have PFAS impacts in their drinking water?
Primary: PFAS
Tangential: drinking water wells, Population, Groundwater flow
Reasoning: We should find the locations of drinking water wells to determine which areas can be affected. To know how many people are affected, we need to know how many people are near the wells. PFAS can continue to contaminate through groundwater, so we should provide a groundwater dataset too.

Question: What is the extent of soil contamination near [X location] due to heavy metals?
Primary: Metals in Soil
Tangential: Soil conditions, Soil Type, Soil pH levels, Industrial discharges, waste management
Reasoning: Although there are many soil related tags, none answers the primary question of soil contamination due to heavy metals, so we generated the “Metals in Soil” tag. Soil conditions, Soil type, Soil pH levels can all be indirectly used to determine the extent of contamination, as different soils can have different rates of contamination. Industrial discharges and waste management are typically the source of contamination due to metal, so data on these will help to identify contamination sources.

Question: “Groundwater monitoring data within 1 mile of [X location].” 
Primary: Groundwater wells
Tangential: soil properties, aquifer, geology, groundwater

Question: “Locations of landfill sites within 5 miles of [X location].”
Primary: Landfills
Tangential: Groundwater wells, emissions, priority sites

Question: “Air quality data for [X city] in the past year.”
Primary: air monitoring station locations
Tangential: meteorology, emissions, air pollution

Question: “Impact of urbanization on local microclimates in [X city].”
Primary: historic temperatures
Tangential: Urban planning, infrastructure, city green spaces, air quality monitoring

Question: “Erosion rates along [X coastline].”
Primary: shoreline mapping
Tangential: tidal and wave, coastal, infrastructure, soil type

Question: “Occurrences of earthquakes in [X region] and their impact on infrastructure.”
Primary: earthquakes
Tangential: infrastructure, soil type, land use

Question: “Noise pollution levels in [X city] and potential health impacts.”
Primary: noise monitoring
Tangential: traffic, construction, noise levels

Question: “Potential locations for geothermal energy in [X region].”
Primary: subsurface temperature
Tangential: geology, tectonic, energy demand, infrastructure

Question: “Trends in plastic waste in [X ocean region] over the past 10 years.”
Primary: ocean plastic
Tangential: waste, shipping routes

You must always output Primary and Tangential. If there isn't a good choice from the list, you can generate one. Do not output Reasoning.`;
