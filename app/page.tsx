"use client";

import MetadataTable from "@/components/MetadataTable";
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
    datasetUrl: "https://discover.data.vic.gov.au/dataset/wifi-device-counts",
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
    datasetUrl: "https://discover.data.vic.gov.au/dataset/noise-observations",
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
    datasetUrl:
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
    datasetUrl:
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
    datasetUrl: "https://discover.data.vic.gov.au/dataset/wind-observations",
    publisher: "City of Ballarat",
    tangential_tag:
      "['sensor data', 'wind speed', 'wind direction', 'atmospheric conditions']",
  },
];

export default function Home() {
  let [message, setMessage] = useState("");
  let [primaryData, setPrimary] = useState([]);
  let [tangentialData, setTangential] = useState([]);

  const handleSubmit = async () => {
    let response = await post("/api/query", {
      query: message
    })
    console.log(response)
    setPrimary(response['primaryData'])
    setTangential(response['tangentialData'])
  };

  const handleEnter = (e: any) => {
    if (e.key === "Enter" && message) {
      handleSubmit();
    } else if (e.key == "Enter") {
      e.preventDefault();
    }
  };

  return (
    <main className="justify-center items-center h-screen">
      {/* <div className="w-1/2 bg-gray-300"></div>
      <div className="w-[2px] bg-gray-500"></div>
      <div className="w-1/2 bg-red-300"></div> */}

      <div className="flex flex-col max-w-5xl font-mono text-sm lg:flex mb-auto mt-6">
        {/* <div className="flex flex-row gap-6">
          <Input placeholder="Longitude" />
          <Input placeholder="Latitude" />
        </div> */}
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
      </div>
    </main>
  );
}
