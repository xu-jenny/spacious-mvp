"use client";
import { useEffect, useState } from "react";
import { DatasetMetadata } from "@/components/MetadataTable";
import Button from "@/components/common/Button";
import DynamicTable from "@/components/common/DynamicTable";
import ChatBox from "@/components/index/ChatBox";
import ChatInput, { ChatMessage } from "@/components/index/ChatInput";

type Props = {
  dataset: DatasetMetadata;
};

export default function DatasetPage() {
  let [chatWithAgent, setChatWithAgent] = useState<boolean>(false);
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const dataset: DatasetMetadata = {
    title: "Sample Dataset",
    summary: "This is a sample dataset",
    lastUpdated: "2021-01-01",
    location: "New York, NY",
    metadata: "This is a sample dataset",
    dataseturl: "https://example.com",
    primary_tag: "",
    tangential_tag: "",
    id: 0,
    created_at: new Date().toISOString(),
    publisher: "Jenny",
  }

  const onNewMessage = async (data: ChatMessage) => {
    console.log(data);
  };

  return (
    <div className="flex h-[100vh]">
      <div className="w-1/2 flex flex-col h-full">
        <h3>{dataset.title}</h3>
        <p>Location: {dataset.location}</p>
        <p>Description: {dataset.summary}</p>
        {/* <DynamicTable data={JSON.parse(dataset.metadata)} /> */}
      </div>
      {chatWithAgent == false ? (
        <Button
          onClick={() => setChatWithAgent(true)}
          text="Chat With Agent"
        ></Button>
      ) : (
        <div className="w-1/2 flex flex-col h-full">
          <ChatBox chatHistory={chatHistory} loading={false} />
          <ChatInput sendANewMessage={onNewMessage} />
        </div>
      )}
    </div>
  );
};
