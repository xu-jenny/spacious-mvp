"use client";

import { supabaseClient } from "@/clients/supabase";
import MetadataTable from "@/components/MetadataTable";
import ChatInput, { ChatMessage } from "@/components/chat/ChatInput";
import Input from "@/components/common/Input";
import { post } from "@/utils/http";
import { useState } from "react";

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

async function getSupabaseData(tags: any, locations: string) {
  if (tags != null && "primarytag" in tags) {
    if ("tangentialtags" in tags) {
      console.log(tags["primarytag"], tags["tangentialtags"], locations);
      let primaryData = await primary_tag_fts(tags["primarytag"], locations);
      let tangentialData = await tangential_tag_fts(
        tags["tangentialtags"].toLowerCase(),
        locations
      );

      return {
        primaryData, //: result["primarytagData"],
        tangentialData, //: result["tangentialTagData"],
      };
    } else {
      console.log("LLM did not generate tangential tags ", tags);
      let primaryData = await primary_tag_fts(tags["primarytag"], locations);
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

export default function Home() {
  let [primaryData, setPrimary] = useState([]);
  let [tangentialData, setTangential] = useState([]);
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleSubmit = async (message: ChatMessage) => {
    let newChatHistory = [...chatHistory, message];
    setChatHistory(newChatHistory);
    let response = await post("http://127.0.0.1:5000/chat", {
      query: message,
      chatHistory: newChatHistory,
    });
    console.log(response);
    if (response != null && "output" in response) {
      let output = response["output"] as string;
      setChatHistory([
        ...newChatHistory,
        { text: output, isChatOwner: false, sentAt: new Date() } as ChatMessage,
      ]);

      let d = parseStringToObject(output);
      console.log(d);
      let data = await getSupabaseData(d, "Melbourne,Syndney,NSW");
      console.log(data);
      if (data != null && "primaryData" in data) {
        setPrimary(data["primaryData"]);
        if ("tangentialData" in data && data["tangentialData"] != null) {
          setTangential(data["tangentialData"]);
        }
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/2 bg-sky-50 overflow-auto">
        <div className="p-4">
          <h2 className="text-2xl font-semi-bold p-2">Primary Data</h2>
          <MetadataTable data={sampleData} paginate={true} />
        </div>
        <hr />
        <div className="p-4">
          <h2 className="text-2xl font-semi-bold p-2">Tangential Data</h2>
          <MetadataTable data={tangentialData} paginate={true} />
        </div>
      </div>
      <div className="w-[2px] bg-gray-200"></div>
      <div className="w-1/2">
        <h2 className="mt-4 mx-4">Interested Location</h2>
        <div className="grid gap-6 mb-6 md:grid-cols-2 px-4 mt-2">
          <Input placeholder="Latitude" />
          <Input placeholder="Longitude" />
        </div>
        <hr />
        <div className="px-4 py-1 overflow-auto h-[calc(100vh-15.5rem)]">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`py-2 flex flex-row w-full ${
                message.isChatOwner ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-2 w-fit py-3 flex flex-col bg-purple-500 rounded-lg text-white ${
                  message.isChatOwner ? "order-1 mr-2" : "order-2 ml-2"
                }`}
              >
                <span className="text-md">{message.text}</span>
              </div>
            </div>
          ))}
        </div>
        <ChatInput
          sendANewMessage={(msg) => {
            console.log(msg);
            handleSubmit(msg);
          }}
        />
      </div>
      {/* <div className="flex flex-col max-w-5xl font-mono text-sm lg:flex mb-auto mt-6">
        <div className="flex flex-row items-center ml-6">
        <input
            type="search"
            id="default-search"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnter}
            className="w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="PFAS Contamination Reports in Perth..."
            required
          />
          <button
            type="submit"
            onClick={() => handleSubmit()}
            className="text-white bg-blue-700 mx-6 h-full w-fit hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Search
          </button>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-2xl font-semi-bold p-2">Primary Data</h2>
        <MetadataTable data={primaryData} />
      </div>
      <hr></hr>
      <div className="p-4">
        <h2 className="text-xl text-gray-700 font-semi-bold p-2">
          Tangential Data
        </h2>
        <MetadataTable data={tangentialData} paginate={true} />
      </div> */}
    </div>
  );
}
