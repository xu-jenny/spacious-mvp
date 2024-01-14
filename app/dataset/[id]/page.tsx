"use client";
import {
  JSXElementConstructor,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import dynamic from "next/dynamic";
import ChatBox from "@/components/index/ChatBox";
import ChatInput, { ChatMessage } from "@/components/index/ChatInput";
import { supabaseClient } from "@/clients/supabase";
import { jsonParse } from "@/utils/json";
import { Dataset, getDataset } from "./util";
import { post } from "@/utils/http";

const Example = {
  id: 254,
  title:
    "MVA Vehicle Sales Counts by Month for Calendar Year 2002 through June 2023",
  summary:
    "The MVA Vehicle Sales Counts by Month dataset collects data on the number of new and used vehicles sold by month in calendar year 2002 through June 2023. It also includes data on the total sales dollars for both new and used vehicles. With this dataset, we can gain insights into seasonal patterns, trends over time, performance by month, sales by type of vehicle, sales by region, and the impact of economic indicators on vehicle sales. Additionally, we can analyze the effectiveness of marketing campaigns and study the product life cycle of different vehicle models. Overall, this dataset provides valuable information for stakeholders in the automobile industry, including manufacturers, dealerships, and policymakers, to make informed decisions.",
  lastUpdated: "2023-09-15T16:53:51.77081",
  firstPublished: "2020-11-10T17:25:39.959031",
  location: "Maryland",
  locationType: "state",
  datasetUrl:
    "[{'name': 'Comma Separated Values File', 'format': 'CSV', 'url': 'https://opendata.maryland.gov/api/views/un65-7ipd/rows.csv?accessType=DOWNLOAD'}, {'name': 'RDF File', 'format': 'RDF', 'url': 'https://opendata.maryland.gov/api/views/un65-7ipd/rows.rdf?accessType=DOWNLOAD'}, {'name': 'JSON File', 'format': 'JSON', 'url': 'https://opendata.maryland.gov/api/views/un65-7ipd/rows.json?accessType=DOWNLOAD'}, {'name': 'XML File', 'format': 'XML', 'url': 'https://opendata.maryland.gov/api/views/un65-7ipd/rows.xml?accessType=DOWNLOAD'}]",
  publisher:
    "{'name': 'State of Maryland', 'contact': 'no-reply@opendata.maryland.gov'}",
  topic: "Vehicle Sales",
  subtags:
    "['Sales Data', 'Monthly Trends', 'New Vehicles', 'Used Vehicles', 'Total Sales']",
  license: "{'title': 'License not specified'}",
};

export default function DatasetPage({
  params: { id },
}: {
  params: { id: number };
}) {
  let [chatWithAgent, setChatWithAgent] = useState<boolean>(false);
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  let [dataset, setDataset] = useState<Dataset | null>(Example);
  let [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   async function fetchDataset() {
  //     let result = await getDataset(id);
  //     if (result == null) {
  //       setError("There was no dataset corresponding to the specified ID.");
  //     } else {
  //       console.log(result);
  //       setDataset(result);
  //     }
  //   }
  //   fetchDataset();
  // }, [id]);

  const datasetUrls =
    dataset?.datasetUrl != null ? jsonParse(dataset?.datasetUrl) : null;
  const onNewMessage = async () => {
    let response = await post("/api/csvagent", {
      filename: `${dataset?.title}.csv`,
      fileUrl: datasetUrls[0]["url"],
      // query: "which year had the most sales?",
      query: "what is the time range of the dataset?",
    });
    console.log(response);
  };

  const showPublisher = (pubStr: string) => {
    const publisher = jsonParse(pubStr);
    return publisher.contact != null ? (
      <a href={publisher.contact} className="font">
        {publisher.name}
      </a>
    ) : (
      <span>{publisher.name}</span>
    );
  };

  return (
    <div className="flex h-[100vh]">
      <div className="w-1/2 flex flex-col h-full">
        <article className="prose p-4 max-w-none">
          <h3>{dataset?.title}</h3>
          <p>Summary: {dataset?.summary}</p>
          <p>Location: {dataset?.location}</p>
          <p>Last updated: {dataset?.lastUpdated}</p>
          <p>
            Publisher:{" "}
            {dataset?.publisher != null && showPublisher(dataset?.publisher)}
          </p>
          <p>Topic: {dataset?.topic}</p>
          <div>
            <span>Dataset Download Links: </span>
            {datasetUrls.map(
                (obj: { name: string; url: string; format: string }, index: number) => (
                  <span key={obj["name"]}>
                    <a
                      href={obj["url"]}
                      className="text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      {obj["name"]}
                    </a>
                    {index != datasetUrls.length-1 && " | "}
                  </span>
                )
              )}
          </div>
          <hr />
        </article>
        {/* <DynamicTable data={JSON.parse(dataset.metadata)} /> */}
      </div>
      {/* {dataset.datasetType == "csv" && (
        <div className="w-3/4 h-[50vh] overflow-auto">
          {reportDownloadState ? (
            <iframe
              src="/downloaded-file.html"
              className="p-4 w-full h-full"
            ></iframe>
          ) : (
            <p>Loading Report...</p>
          )}
        </div>
      )} */}
      <div className="w-1/2 flex flex-col h-full">
        <ChatBox chatHistory={chatHistory} loading={false} />
        {error != null && <span className="text-red ml-7">{error}</span>}
        <ChatInput sendANewMessage={onNewMessage} />
      </div>
      {/* <div>
        {chatWithAgent == false ? (
          <Button
            onClick={() => setChatWithAgent(true)}
            text="Chat With Agent"
          ></Button>
        ) : (
          <div className="">
            <ChatBox chatHistory={chatHistory} loading={false} />
            <ChatInput sendANewMessage={onNewMessage} />
          </div>
        )}
      </div> */}
    </div>
  );
}
