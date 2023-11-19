"use client";

import { getIntersectSuburbs, supabaseClient } from "@/clients/supabase";
import MetadataTable from "@/components/MetadataTable";
import ChatInput, { ChatMessage } from "@/components/chat/ChatInput";
import Input from "@/components/common/Input";
import { post } from "@/utils/http";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { primary_tag_fts, tangential_tag_fts } from "./api/keyword/utils";
import { addressToCoord } from "./api/location/utils";
import { getIntersectPlaces } from "./api/location/route";

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

async function getSupabaseData(tags: any, locations: string) {
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

function parseStringToObject(input: string): Record<string, string> {
  const lines = input.split("\n");
  const result: Record<string, string> = {};

  for (const line of lines) {
    const [key, value] = line.split(":");
    if (key && value) {
      result[key.replace(" ", "").trim().toLowerCase()] = value.trim();
    }
  }

  return result;
}

function jsonParse(output: string) {
  try {
    return JSON.parse(output.replaceAll("'", '"'));
  } catch (e) {
    console.log(e);
    return null;
  }
}

interface IFormInput {
  address?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export default function Home() {
  let [primaryData, setPrimary] = useState([]);
  let [tangentialData, setTangential] = useState([]);
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  let [location, setLocation] = useState<string[] | null>(null);

  const handleChatSubmit = async (message: ChatMessage) => {
    let newChatHistory = [...chatHistory, message];
    setChatHistory(newChatHistory);
    let response = await post("http://127.0.0.1:5000/chat", {
      query: message,
      chatHistory: newChatHistory,
    });
    // let response = {
    //   chat_history: [
    //     {
    //       id: ["langchain", "schema", "messages", "HumanMessage"],
    //       kwargs: {
    //         content: "water condition near Perth",
    //       },
    //       lc: 1,
    //       type: "constructor",
    //     },
    //     {
    //       id: ["langchain", "schema", "messages", "HumanMessage"],
    //       kwargs: {
    //         content: "water condition near Perth",
    //       },
    //       lc: 1,
    //       type: "constructor",
    //     },
    //     {
    //       id: ["langchain", "schema", "messages", "AIMessage"],
    //       kwargs: {
    //         content:
    //           "{'primary_tag': 'Water Quality', 'tangential_tags': 'River Network, Waterways, Pollution Sources, Groundwater Wells'}",
    //       },
    //       lc: 1,
    //       type: "constructor",
    //     },
    //   ],
    //   output:
    //     "{'primary_tag': 'Water Quality', 'tangential_tags': 'River Network, Waterways, Pollution Sources, Groundwater Wells'}",
    // };
    console.log(response);
    if (response != null && "output" in response) {
      let output = response["output"] as string;
      setChatHistory([
        ...newChatHistory,
        {
          text: output,
          isChatOwner: false,
          sentAt: new Date(),
        } as ChatMessage,
      ]);

      // check if answer contain tags
      console.log(output.replaceAll("'", '"'));
      // let d = jsonParse('{"primary_tag": "Water Quality", "tangential_tags": "River Network, Waterways, Pollution Sources, Groundwater Wells"}');
      // let d = parseStringToObject(output);
      let d = jsonParse(output);
      console.log(d);
      if (d != null) {
        let data = await getSupabaseData(d, "Melbourne,Syndney,NSW");
        console.log(data);
        if (data != null && "primaryData" in data) {
          setPrimary(data["primaryData"]);
          if ("tangentialData" in data && data["tangentialData"] != null) {
            setTangential(data["tangentialData"]);
          }
        }
      }
    }
  };

  const { register, handleSubmit } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log(data);
    if (data["latitude"] && data["longitude"]) {
      let locations = await getIntersectPlaces(
        { lat: data["latitude"], lon: data["longitude"] },
        data["radius"]
      );
      if (locations != null) {
        setLocation(locations);
      }
    } else if (data["address"]) {
      let coords = await addressToCoord(data.address);
      if (coords != null) {
        let locations = await getIntersectPlaces(coords, data["radius"]);
        if (locations != null) {
          setLocation(locations);
        }
      }
    } else if (data["region"]) {
      setLocation([data["region"]]);
    }

    // let resp = await getIntersectSuburbs(
    //   location.lon,
    //   location.lat,
    //   radius == null ? 0 : radius * 1000
    // );
    // if (resp != null && typeof resp != "string") {
    //   let { suburbs, states } = resp;
    //   locations = [...suburbs, ...Array.from(states.values())].join(",");
    // } else {
    //   return NextResponse.json({
    //     error:
    //       "We were not able to extract a location from the provided query. Are you sure the location is in Australia?",
    //     status: 204,
    //   });
    // }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/2 bg-sky-50 overflow-auto">
        <div className="p-4">
          <h2 className="text-2xl font-semi-bold p-2">Primary Data</h2>
          <MetadataTable data={primaryData} paginate={true} />
        </div>
        <hr />
        <div className="p-4">
          <h2 className="text-2xl font-semi-bold p-2">Tangential Data</h2>
          <MetadataTable data={tangentialData} paginate={true} />
        </div>
      </div>
      <div className="w-[2px] bg-gray-200"></div>
      <div className="w-1/2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="mt-4 mx-4">Interested Location: {location} </h2>
          <div className="grid gap-6 mb-6 md:grid-cols-2 px-4 mt-2">
            <input
              placeholder="Latitude"
              {...register("latitude")}
              //  {
              //   required: true,
              //   pattern: /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/,
              // })}
            />
            <input
              placeholder="Longitude"
              {...register("longitude")}
              // {
              //   required: true,
              //   pattern:
              //     /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/,
              // })}
            />
            <input placeholder="region" {...register("region")} />
            <input
              type="number"
              placeholder="Radius of interest in km"
              {...register("radius")}
            />
          </div>
          ·
          <hr />
          <div className="px-4 py-1 overflow-auto h-[calc(100vh-15.5rem)]">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`py-2 flex flex-row w-full ${
                  message.isChatOwner ? "justify-end" : "justify-start"
                }`}>
                <div
                  className={`px-2 w-fit py-3 flex flex-col bg-purple-500 rounded-lg text-white ${
                    message.isChatOwner ? "order-1 mr-2" : "order-2 ml-2"
                  }`}>
                  <span className="text-md">{message.text}</span>
                </div>
              </div>
            ))}
          </div>
          <ChatInput
            sendANewMessage={(msg) => {
              console.log(msg);
              // handleSubmit(msg);
            }}
          />
        </form>
      </div>
    </div>
  );
}
