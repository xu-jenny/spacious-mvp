"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ChatBox from "@/components/index/ChatBox";
import ChatInput, { ChatMessage } from "@/components/index/ChatInput";
import { supabaseClient } from "@/clients/supabase";
import { jsonParse } from "@/utils/json";
import { Dataset, getDataset } from "./util";
import { post } from "@/utils/http";

export default function DatasetPage({
  params: { id },
}: {
  params: { id: number };
}) {
  let [chatWithAgent, setChatWithAgent] = useState<boolean>(false);
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  let [dataset, setDataset] = useState<Dataset | null>(null);
  let [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDataset() {
      let result = await getDataset(id);
      if (result == null) {
        setError("There was no dataset corresponding to the specified ID.");
      } else {
        console.log(result);
        setDataset(result);
      }
    }
    fetchDataset();
  }, [id]);

  const datasetUrls =
    dataset?.datasetUrl != null ? jsonParse(dataset?.datasetUrl) : null;

  const onNewMessage = async () => {
    let response = await post("/api/csvagent", {
      filename: `${dataset?.title}.csv`,
      fileUrl: datasetUrls[0]["url"],
      // query: "which year had the most sales?",
      query: "what is the time range of the dataset?"
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
        <h3>{dataset?.title}</h3>
        <p>Description: {dataset?.summary}</p>
        <p>Location: {dataset?.location}</p>
        <p>LocationGranuarity: {dataset?.locationType}</p>
        <p>Last updated: {dataset?.lastUpdated}</p>
        <p>
          Publisher:{" "}
          {dataset?.publisher != null && showPublisher(dataset?.publisher)}
        </p>
        <p>Topic: {dataset?.topic}</p>
        <hr />
        {/* {datasetUrls.forEach(urlObj => <p><a href={urlObj['url']}>{urlObj['name']}</a></p>)} */}
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
      <div className="">
        <button onClick={onNewMessage}>Send</button>
        {/* <ChatBox chatHistory={chatHistory} loading={false} /> */}
        {/* <ChatInput sendANewMessage={onNewMessage} /> */}
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
