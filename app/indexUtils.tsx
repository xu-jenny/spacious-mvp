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

export async function getSupabaseData(tags: any, locations: string) {
  if (tags != null && "primary_tag" in tags) {
    if ("tangential_tags" in tags) {
      console.log(tags["primary_tag"], tags["tangential_tags"], locations);
      let primaryData = await primary_tag_fts(tags["primary_tag"], locations);
      let tangentialData = await tangential_tag_fts(
        tags["tangential_tags"].toLowerCase().replaceAll(", ", ","),
        locations
      );

      return {
        primaryData, //: result["primarytagData"],
        tangentialData, //: result["tangentialTagData"],
      };
    } else {
      console.log("LLM did not generate tangential tags ", tags);
      let primaryData = await primary_tag_fts(tags["primary_tag"], locations);
      return { primaryData };
    }
  }
}


const sampleData = [
  {
    id: 5227,
    created_at: "2023-10-26T14:41:57.945507+00:00",
    title: "Wifi Device Counts",
    summary:
      "This dataset collects WiFi device counts from nCounters distributed in Ballarat. It can be used to understand the density and distribution of WiFi devices in Ballarat",
    lastUpdated: "2023-10-18",
    location: "Ballarat",
    metadata:
      '{"description": "This dataset describes counts made of wifi devices by nCounters distributed in Ballarat.", "organisation": "City of Ballarat", "category": "Local government", "metadata_url": "https://data.ballarat.vic.gov.au/explore/dataset/wifi-device-counts/information/", "license": null, "dateCreated": "08/08/2022", "publisher_url": "/organization/city-of-ballarat", "data_formats": "[\'csv\', \'json\', \'geojson\', \'kml\', \'shp\', \'xls\']"}',
    primary_tag: "wifi devices",
    dataseturl: "https://discover.data.vic.gov.au/dataset/wifi-device-counts",
    publisher: "City of Ballarat",
    tangential_tag: "['wifi density', 'wifi distribution', 'ballarat']",
  },
  {
    id: 5228,
    created_at: "2023-10-26T14:41:57.945507+00:00",
    title: "Noise Observations",
    summary:
      "This dataset collects noise observation data from sensors distributed in Ballarat",
    lastUpdated: "2023-10-18",
    location: "Ballarat",
    metadata:
      '{"description": "This dataset describes observations made of sound pressure by sensors distributed in Ballarat.", "organisation": "City of Ballarat", "category": "Local government", "metadata_url": "https://data.ballarat.vic.gov.au/explore/dataset/noise-observations/information/", "license": null, "dateCreated": "08/08/2022", "publisher_url": "/organization/city-of-ballarat", "data_formats": "[\'csv\', \'json\', \'geojson\', \'kml\', \'shp\', \'xls\']"}',
    primary_tag: "noise pollution",
    dataseturl: "https://discover.data.vic.gov.au/dataset/noise-observations",
    publisher: "City of Ballarat",
    tangential_tag: "['sensor data', 'noise observations', 'ballarat']",
  },
  {
    id: 5229,
    created_at: "2023-10-26T14:41:57.945507+00:00",
    title: "Air Pressure Observations",
    summary:
      "This dataset collects air pressure observations made by sensors distributed in Ballarat. The information is intended to inform the public of the historical measured observations of air pressure in Ballarat",
    lastUpdated: "2023-10-18",
    location: "Ballarat",
    metadata:
      '{"description": "This dataset describes observations made of air pressure by sensors distributed in Ballarat.The information was collected in real time by the sensors.The intended use of the information is to inform the public of the historical measured observations of air pressure in Ballarat.The dataset is typically updated every 15 minutes.The City of Ballarat is not an official source of weather information. These observations are provided to the public for informative purposes only. Use other\\u00a0channels for official meteorological observations and forecasts.", "organisation": "City of Ballarat", "category": "Local government", "metadata_url": "https://data.ballarat.vic.gov.au/explore/dataset/air-pressure-observations/information/", "license": null, "dateCreated": "08/08/2022", "publisher_url": "/organization/city-of-ballarat", "data_formats": "[\'csv\', \'json\', \'geojson\', \'kml\', \'shp\', \'xls\']"}',
    primary_tag: "air pressure",
    dataseturl:
      "https://discover.data.vic.gov.au/dataset/air-pressure-observations",
    publisher: "City of Ballarat",
    tangential_tag: "['sensor data', 'historical trends']",
  },
  {
    id: 5230,
    created_at: "2023-10-26T14:41:57.945507+00:00",
    title: "Air Quality Observations",
    summary: "Precipitation observations recorded by sensors in Ballarat",
    lastUpdated: "2023-10-18",
    location: "Ballarat",
    metadata:
      '{"description": "This dataset describes observations made of air quality by sensors distributed in Ballarat.", "organisation": "City of Ballarat", "category": "Local government", "metadata_url": "https://data.ballarat.vic.gov.au/explore/dataset/air-quality-observations/information/", "license": null, "dateCreated": "08/08/2022", "publisher_url": "/organization/city-of-ballarat", "data_formats": "[\'csv\', \'json\', \'geojson\', \'kml\', \'shp\', \'xls\']"}',
    primary_tag: "lightning",
    dataseturl:
      "https://discover.data.vic.gov.au/dataset/air-quality-observations",
    publisher: "City of Ballarat",
    tangential_tag:
      "['lightning frequency', 'lightning intensity', 'lightning duration', 'lightning location']",
  },
  {
    id: 5231,
    created_at: "2023-10-26T14:41:57.945507+00:00",
    title: "Wind Observations",
    summary:
      "This dataset collects wind observation data from sensors distributed in Ballarat",
    lastUpdated: "2023-10-18",
    location: "Ballarat",
    metadata:
      '{"description": "This dataset describes observations made of wind by sensors distributed in Ballarat.", "organisation": "City of Ballarat", "category": "Local government", "metadata_url": "https://data.ballarat.vic.gov.au/explore/dataset/wind-observations/information/", "license": null, "dateCreated": "08/08/2022", "publisher_url": "/organization/city-of-ballarat", "data_formats": "[\'csv\', \'json\', \'geojson\', \'kml\', \'shp\', \'xls\']"}',
    primary_tag: "wind observations",
    dataseturl: "https://discover.data.vic.gov.au/dataset/wind-observations",
    publisher: "City of Ballarat",
    tangential_tag:
      "['sensor data', 'wind speed', 'wind direction', 'atmospheric conditions']",
  },
];

const messages = [
  {
    text: "Hey!",
    isChatOwner: true,
  },
  {
    text: "Hey, devlazar!",
    isChatOwner: false,
  },
  {
    text: "Do you like this chat?",
    isChatOwner: true,
  },
  {
    text: "Looks nice!",
    isChatOwner: false,
  },
  {
    text: "n publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.",
    isChatOwner: true,
  },
  {
    text: "n publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.",
    isChatOwner: false,
  },
  {
    text: "n publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.",
    isChatOwner: true,
  },
  {
    text: "n publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.",
    isChatOwner: false,
  },
  {
    text: "n publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.",
    isChatOwner: true,
  },
  {
    text: "n publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.",
    isChatOwner: false,
  },
  {
    text: "n publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.",
    isChatOwner: true,
  },
];

