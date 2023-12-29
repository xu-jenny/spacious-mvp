"use client";
import { useEffect, useState } from "react";
import { DatasetMetadata } from "@/components/MetadataTable";
import Button from "@/components/common/Button";
import DynamicTable from "@/components/common/DynamicTable";
import ChatBox from "@/components/index/ChatBox";
import ChatInput, { ChatMessage } from "@/components/index/ChatInput";
import { downloadFile } from "@/clients/s3";
import { post } from "@/utils/http";

type Props = {
  dataset: DatasetMetadata;
};

export default function DatasetPage() {
  let [chatWithAgent, setChatWithAgent] = useState<boolean>(false);
  let [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  let [reportDownloadState, setReportDownloadState] = useState<boolean>(false);

  const dataset: DatasetMetadata = {
    title: "FDIC Failed Bank List",
    summary:
      "The FDIC is often appointed as receiver for failed banks. This list includes banks which have failed since October 1, 2000.",
    lastUpdated: "2020-11-12",
    location: "USA",
    locationGranularity: "country",
    metadata: null,
    datasetUrl: "https://www.fdic.gov/bank/individual/failed/banklist.csv",
    primary_tag: "Failed Banks",
    tangential_tag: "Economic",
    id: 0,
    created_at: new Date().toISOString(),
    publisher: {
      name: "Division of Insurance and Research",
    },
    datasetType: "csv",
    reportS3Key:
      "au_gov_ACTGOV-BLOCK_Environment,-Planning,-and-Sustainable-Directorate-|-ACT-Government.html.gz",
  };

  const onNewMessage = async (msg: ChatMessage) => {
    console.log(msg);
    let response = await post(
      process.env.NODE_ENV == "development"
        ? "http://127.0.0.1:5000/chat_csv"
        : process.env.NEXT_PUBLIC_BACKEND_SERVER_URL + "/chat_csv",
      {
        url: "https://www.fdic.gov/bank/individual/failed/banklist.csv",
        query: msg.text,
        insights: `Info about this dataset:
        The columns in the dataset are:\n1. Bank Name: Name of the bank\n2. City: City where the bank is located\n3. State: State where the bank is located\n4. Cert: Certification number\n5. Acquiring Institution: Name of the acquiring institution\n6. Closing Date: Date when the bank was closed\n7. Fund: Fund number.
        The "Closing Date" column contains date values, indicating that it is a timeseries. The timeseries spans from October 13, 2000, to November 3, 2023.
        Now answer the user's question. Do not use any previous knowlegde.`
      }
    );
    console.log("response from flask server: ", response);
  };


  useEffect(() => {
    const fetchData = async () => {
      const bucketName = "sp-data-silver"; // Replace with your S3 bucket name
      const key = dataset.reportS3Key!; // Replace with the key of the file you want to download
      await downloadFile(bucketName, key, "downloaded-file.html")
      setReportDownloadState(true);
    };
    if (dataset.datasetType === "csv" && dataset.reportS3Key != null) {
      fetchData();
    }
  }, [dataset.datasetType, dataset.reportS3Key]);

  return (
    <div className="flex h-[100vh]">
      <div className="w-1/2 flex flex-col h-full">
        <h3>{dataset.title}</h3>
        <p>Description: {dataset.summary}</p>
        <p>Location: {dataset.location}</p>
        <p>LocationGranuarity: {dataset.locationGranularity}</p>
        <p>Last updated: {dataset.lastUpdated}</p>
        <p>
          Publisher:{" "}
          {dataset.publisher.url != null ? (
            <a href={dataset.publisher.url}>{dataset.publisher.name}</a>
          ) : (
            <span>{dataset.publisher.name}</span>
          )}
        </p>
        <p>{dataset.primary_tag}</p>
        <hr />
        <p>
          {dataset.datasetType}: {dataset.datasetUrl}
        </p>

        {/* <DynamicTable data={JSON.parse(dataset.metadata)} /> */}
      </div>
      {dataset.datasetType == "csv" && (
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
      )}
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
    </div>
  );
}
